import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assertEmailVerified,
  refreshWithToken,
  resetPassword,
  sendVerifyEmail,
  verifyEmailCode,
  verifyWithToken,
} from '../../src/services/auth/auth.service';
import { sendVerificationMail } from '../../src/services/auth/mailer';
import { issueTokens } from '../../src/services/auth/token.service';
import { resetMemoryAuthStore } from '../helpers/memory-auth-store';

const dbState = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  update: vi.fn(),
}));

vi.mock('../../src/db', () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => dbState.rows }) }) }),
    update: () => ({ set: (values: unknown) => ({ where: async () => dbState.update(values) }) }),
  },
}));

vi.mock('../../src/utils/password', () => ({
  hashPassword: vi.fn(async (password: string) => `hashed:${password}`),
}));

vi.mock('../../src/services/auth/mailer', () => ({
  sendVerificationMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/services/auth/auth.store', async () => ({
  authStore: (await import('../helpers/memory-auth-store')).memoryAuthStore,
}));

const mailMock = vi.mocked(sendVerificationMail);

/** 발송된 메일에서 인증 코드를 꺼낸다. */
async function requestCode(email: string): Promise<string> {
  await sendVerifyEmail(email);
  const call = mailMock.mock.calls.at(-1);
  if (!call) throw new Error('메일이 발송되지 않았습니다.');
  return call[1];
}

beforeEach(() => {
  resetMemoryAuthStore();
  mailMock.mockReset().mockResolvedValue(undefined);
  dbState.rows = [];
  dbState.update.mockReset();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-12T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('이메일 인증 코드', () => {
  it.each([
    'not-an-email',
    '"victim@church.org"@attacker.com',
    'victim@church.org, attacker@evil.com',
    'Victim <attacker@evil.com>',
    'a@b.com;c@d.com',
    `${'a'.repeat(250)}@b.com`,
  ])('단일 일반 주소가 아니면 거부한다: %s', async (email) => {
    await expect(sendVerifyEmail(email)).rejects.toMatchObject({ statusCode: 400 });
    expect(mailMock).not.toHaveBeenCalled();
  });

  it('6자리 코드를 발송하고, 맞는 코드면 인증 상태가 된다', async () => {
    const code = await requestCode('Member@Church.org');
    expect(code).toMatch(/^[0-9a-f]{6}$/);
    expect(mailMock).toHaveBeenCalledWith('Member@Church.org', code);

    await expect(assertEmailVerified('member@church.org')).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(verifyEmailCode('member@church.org', ` ${code.toUpperCase()} `)).resolves.toBe(
      true,
    );
    await expect(assertEmailVerified('MEMBER@church.org')).resolves.toBeUndefined();
  });

  it('코드는 한 번만 쓸 수 있다', async () => {
    const code = await requestCode('member@church.org');
    await expect(verifyEmailCode('member@church.org', code)).resolves.toBe(true);
    await expect(verifyEmailCode('member@church.org', code)).resolves.toBe(false);
  });

  it('5번 틀리면 코드를 폐기한다', async () => {
    const code = await requestCode('member@church.org');
    for (let i = 0; i < 5; i += 1) {
      await expect(verifyEmailCode('member@church.org', 'zzzzzz')).resolves.toBe(false);
    }
    await expect(verifyEmailCode('member@church.org', code)).resolves.toBe(false);
    await expect(assertEmailVerified('member@church.org')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('60초 안에 다시 요청하면 429를 반환한다', async () => {
    await requestCode('member@church.org');
    await expect(sendVerifyEmail('member@church.org')).rejects.toMatchObject({ statusCode: 429 });
    vi.setSystemTime(Date.now() + 61_000);
    await expect(requestCode('member@church.org')).resolves.toMatch(/^[0-9a-f]{6}$/);
  });

  it('메일 발송이 실패하면 500을 반환하고 바로 다시 요청할 수 있다', async () => {
    mailMock.mockRejectedValueOnce(new Error('smtp down'));
    await expect(sendVerifyEmail('member@church.org')).rejects.toMatchObject({
      statusCode: 500,
      code: 'MAIL_SEND_FAILED',
    });
    await expect(requestCode('member@church.org')).resolves.toMatch(/^[0-9a-f]{6}$/);
  });

  it('코드는 30분 뒤 만료된다', async () => {
    const code = await requestCode('member@church.org');
    vi.setSystemTime(Date.now() + 30 * 60 * 1000 + 1000);
    await expect(verifyEmailCode('member@church.org', code)).resolves.toBe(false);
  });
});

describe('비밀번호 재설정', () => {
  it('계정 이메일 인증 없이는 재설정할 수 없다', async () => {
    dbState.rows = [{ id: 7, email: 'member@church.org' }];
    await expect(resetPassword(7, 'NewPass1!')).rejects.toMatchObject({ statusCode: 403 });
    expect(dbState.update).not.toHaveBeenCalled();
  });

  it('다른 이메일로 인증해서는 남의 계정을 재설정할 수 없다', async () => {
    dbState.rows = [{ id: 7, email: 'victim@church.org' }];
    const code = await requestCode('attacker@evil.com');
    await verifyEmailCode('attacker@evil.com', code);
    await expect(resetPassword(7, 'NewPass1!')).rejects.toMatchObject({ statusCode: 403 });
    expect(dbState.update).not.toHaveBeenCalled();
  });

  it('인증 후 재설정하면 기존 세션이 끊기고 인증 상태는 소모된다', async () => {
    dbState.rows = [{ id: 7, email: 'Member@Church.org', name: '테스트' }];
    const oldTokens = await issueTokens({ email: 'Member@Church.org', name: '테스트' });
    vi.setSystemTime(Date.now() + 5_000);

    const code = await requestCode('Member@Church.org');
    await verifyEmailCode('Member@Church.org', code);
    await resetPassword(7, 'NewPass1!');

    expect(dbState.update).toHaveBeenCalledWith({ password: 'hashed:NewPass1!' });
    await expect(verifyWithToken(oldTokens.accessToken)).rejects.toMatchObject({ statusCode: 400 });
    await expect(refreshWithToken(oldTokens.refreshToken)).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(resetPassword(7, 'Again1!!')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('없는 사용자는 404를 반환한다', async () => {
    dbState.rows = [];
    await expect(resetPassword(999, 'NewPass1!')).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('토큰 갱신', () => {
  it('DB의 현재 이름으로 새 토큰을 발급한다', async () => {
    const { refreshToken } = await issueTokens({ email: 'member@church.org', name: '옛이름' });
    dbState.rows = [{ email: 'member@church.org', name: '새이름' }];
    const renewed = await refreshWithToken(refreshToken);
    await expect(verifyWithToken(renewed.accessToken)).resolves.toEqual({
      email: 'member@church.org',
      name: '새이름',
    });
  });

  it('삭제된 사용자는 갱신할 수 없다', async () => {
    const { refreshToken } = await issueTokens({ email: 'gone@church.org', name: '테스트' });
    dbState.rows = [];
    await expect(refreshWithToken(refreshToken)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('잘못된 액세스 토큰은 예전과 같이 400을 반환한다', async () => {
    await expect(verifyWithToken('garbage')).rejects.toMatchObject({ statusCode: 400 });
  });
});
