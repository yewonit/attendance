# 📋 **API Request/Response DTO 문서**

## 🏥 **Health Check**

### `GET /health-check`

```typescript
// RequestDto: 없음

// ResponseDto
interface HealthCheckResponse {
	status: string; // "OK"
}
```

---

## 🔐 **Authentication APIs**

### `POST /auth/register`

```typescript
// RequestDto
interface RegisterRequest {
	id: number;
	email: string;
	password: string;
}

// ResponseDto
interface RegisterResponse {
	// userService.setEmailAndPassword 결과 (updated count)
	[0]: number; // 업데이트된 행 수
}
```

### `POST /auth/login`

```typescript
// RequestDto
interface LoginRequest {
	email: string;
	password: string;
}

// ResponseDto
interface LoginResponse {
	tokens: {
		// loginWithEmailAndPassword 결과 (외부 인증 서버 응답)
		[key: string]: any;
	};
	userData: {
		id: number;
		name: string;
		email: string;
		phoneNumber: string;
		roles: Array<{
			userHasRoleId: number;
			roleId: number;
			roleStart: string; // 날짜
			roleEnd: string; // 날짜
			roleName: string;
			roleCreatedAt: string; // 날짜
			permissionName: string;
			organizationId: number;
			organizationName: string;
			organizationCode: string;
			organizationDescription: string;
		}>;
	};
}
```

### `GET /auth/login`

```typescript
// RequestDto
interface TokenVerifyRequest {
	// Headers
	Authorization: string; // "Bearer {accessToken}"
}

// ResponseDto
interface TokenVerifyResponse {
	user: {
		id: number;
		name: string;
		email: string;
		phoneNumber: string;
		roles: Array<{
			userHasRoleId: number;
			roleId: number;
			roleStart: string;
			roleEnd: string;
			roleName: string;
			roleCreatedAt: string;
			permissionName: string;
			organizationId: number;
			organizationName: string;
			organizationCode: string;
			organizationDescription: string;
		}>;
	};
}
```

### `POST /auth/refresh`

```typescript
// RequestDto
interface RefreshTokenRequest {
	refreshToken: string;
}

// ResponseDto
interface RefreshTokenResponse {
	// refreshWithToken 결과 (외부 인증 서버 응답)
	[key: string]: any;
}
```

### `POST /auth/code`

```typescript
// RequestDto
interface SendVerifyEmailRequest {
	email: string;
}

// ResponseDto: 204 No Content
```

### `POST /auth/verify`

```typescript
// RequestDto
interface VerifyEmailCodeRequest {
	email: string;
	code: string;
}

// ResponseDto
interface VerifyEmailCodeResponse {
	// verifyEmailCode 결과 (외부 인증 서버 응답)
	[key: string]: any;
}
```

### `POST /auth/reset-password`

```typescript
// RequestDto
interface ResetPasswordRequest {
	id: number;
	password: string;
}

// ResponseDto
interface ResetPasswordResponse {
	// boolean true
	[key: string]: boolean;
}
```

### `GET /auth/users/email`

```typescript
// RequestDto
interface EmailDuplicationCheckRequest {
	// Query params
	email: string;
}

// ResponseDto
interface EmailDuplicationCheckResponse {
	message: string; // "이메일 사용 가능"
	email: string;
}
```

### `GET /auth/users/name`

```typescript
// RequestDto
interface UserNameExistsRequest {
	// Query params
	name: string;
}

// ResponseDto
interface UserNameExistsResponse {
	message: string; // "이름이 있습니다." | "이름이 없습니다."
}
```

### `POST /auth/users/phone-number`

```typescript
// RequestDto
interface CheckUserPhoneNumberRequest {
	name: string;
	phoneNumber: string;
}

// ResponseDto
interface CheckUserPhoneNumberResponse {
	isMatched: boolean; // true
	userData: {
		id: number;
		name: string;
		email: string;
		phoneNumber: string;
		roles: Array<{
			userHasRoleId: number;
			roleId: number;
			roleStart: string;
			roleEnd: string;
			roleName: string;
			roleCreatedAt: string;
			organizationId: number;
			organizationName: string;
			organizationCode: string;
			organizationDescription: string;
		}>;
	};
}
```

---

## 👥 **Users APIs**

### `POST /api/users`

```typescript
// RequestDto
interface CreateUserRequest {
	userData: {
		name: string;
		name_suffix?: string;
		gender_type?: string;
		birth_date?: string;
		country?: string;
		phone_number: string;
		church_registration_date?: string;
		is_new_member?: string; // "Y" | "N"
	};
	organizationId: number;
	idOfCreatingUser: number;
}

// ResponseDto
interface CreateUserResponse {
	// User 모델 객체
	id: number;
	name: string;
	name_suffix: string;
	gender_type: string;
	birth_date: string;
	country: string;
	phone_number: string;
	church_registration_date: string;
	is_new_member: string;
	creator_id: number;
	updater_id: number;
	creator_ip: string;
	updater_ip: string;
	created_at: string;
	updated_at: string;
	// ... 기타 User 모델 필드들
}
```

### `GET /api/users`

```typescript
// RequestDto: 없음

// ResponseDto
interface FindUsersResponse {
	data: Array<{
		// User 모델의 모든 필드들 (password 제외)
		id: number;
		name: string;
		email: string;
		phone_number: string;
		// ... 기타 모든 User 필드들
	}>;
}
```

### `GET /api/users/:id`

```typescript
// RequestDto
interface FindUserRequest {
	// Path params
	id: string;
}

// ResponseDto
interface FindUserResponse {
	data: {
		// User 모델 객체
		id: number;
		name: string;
		email: string;
		phone_number: string;
		// ... 기타 모든 User 필드들
	};
}
```

### `PUT /api/users`

```typescript
// RequestDto
interface UpdateUserRequest {
	id: number;
	name?: string;
	email?: string;
	password?: string;
	phone_number?: string;
	// ... 기타 업데이트 가능한 필드들
}

// ResponseDto
interface UpdateUserResponse {
	// 업데이트된 행 수
	[0]: number;
}
```

### `DELETE /api/users`

```typescript
// RequestDto
interface DeleteUserRequest {
	id: number;
}

// ResponseDto
interface DeleteUserResponse {
	// 삭제된 행 수
	[0]: number;
}
```

### `GET /api/users/name`

```typescript
// RequestDto
interface FindUserByNameRequest {
	// Query params
	name: string;
}

// ResponseDto
interface FindUserByNameResponse {
	message: string; // "이름이 있습니다." | "이름이 없습니다."
}
```

### `POST /api/users/phone-number`

```typescript
// RequestDto
interface CheckUserPhoneNumberRequest {
	name: string;
	phoneNumber: string;
}

// ResponseDto
interface CheckUserPhoneNumberResponse {
	isMatched: boolean;
	userData: {
		id: number;
		name: string;
		email: string;
		phoneNumber: string;
		roles: Array<{
			userHasRoleId: number;
			roleId: number;
			roleStart: string;
			roleEnd: string;
			roleName: string;
			roleCreatedAt: string;
			organizationId: number;
			organizationName: string;
			organizationCode: string;
			organizationDescription: string;
		}>;
	};
}
```

### `GET /api/users/search`

```typescript
// RequestDto
interface SearchMembersByNameRequest {
	// Query params
	name: string;
}

// ResponseDto
interface SearchMembersByNameResponse {
	success: boolean;
	data?: Array<{
		id: number;
		name: string;
		phoneNumber: string;
		organizations: Array<{
			organizationName: string;
			organizationId: number;
			roleName: string;
		}>;
		isNewMember: boolean;
	}>;
	message?: string; // 에러 시
}
```

---

## 🏢 **Organizations APIs**

### `POST /api/organizations`

```typescript
// RequestDto
interface CreateOrganizationRequest {
	organization_name: string;
	organization_code: string;
	organization_description?: string;
	// ... 기타 Organization 필드들
}

// ResponseDto
interface CreateOrganizationResponse {
	data: {
		// Organization 모델 객체
		id: number;
		organization_name: string;
		organization_code: string;
		organization_description: string;
		// ... 기타 모든 Organization 필드들
	};
}
```

### `GET /api/organizations`

```typescript
// RequestDto: 없음

// ResponseDto
interface FindOrganizationsResponse {
	data: Array<{
		// Organization 모델의 모든 필드들
		id: number;
		organization_name: string;
		organization_code: string;
		organization_description: string;
		// ... 기타 모든 Organization 필드들
	}>;
}
```

### `GET /api/organizations/:id`

```typescript
// RequestDto
interface FindOrganizationRequest {
	// Path params
	id: string;
}

// ResponseDto
interface FindOrganizationResponse {
	data: {
		// Organization 모델 객체
		id: number;
		organization_name: string;
		organization_code: string;
		// ... 기타 모든 Organization 필드들
	};
}
```

### `PUT /api/organizations`

```typescript
// RequestDto
interface UpdateOrganizationRequest {
	id: number;
	organization_name?: string;
	organization_code?: string;
	organization_description?: string;
	// ... 기타 업데이트 가능한 필드들
}

// ResponseDto
interface UpdateOrganizationResponse {
	// 업데이트된 행 수
	[0]: number;
}
```

### `DELETE /api/organizations`

```typescript
// RequestDto
interface DeleteOrganizationRequest {
	id: number;
}

// ResponseDto
interface DeleteOrganizationResponse {
	// 삭제된 행 수
	[0]: number;
}
```

### `GET /api/organizations/coramdeo/members`

```typescript
// RequestDto: 없음

// ResponseDto
interface CoramdeoMembersResponse {
	// 복잡한 중첩 구조
	data: Array<{
		// gook 정보 (Organization 모델의 모든 필드)
		id: number;
		organization_name: string;
		organization_code: string;
		organization_description: string;
		season_id: number;
		upper_organization_id: number;
		// ... 기타 Organization 필드들
		groups: Array<
			Array<{
				// group 정보
				id: number;
				organization_name: string;
				organization_code: string;
				// ... 기타 Organization 필드들
				members: Array<{
					id: number; // user_id
					name: string;
					email: string;
					phoneNumber: string;
					role: string; // role_name
				}>;
			}>
		>;
	}>;
}
```

### `GET /api/organizations/gooks`

```typescript
// RequestDto
interface GetGooksRequest {
	// Query params
	year?: number;
}

// ResponseDto
interface GetGooksResponse {
	data: Array<{
		// Organization 모델 객체들 (국 레벨)
		id: number;
		organization_name: string;
		organization_code: string;
		season_id: number;
		upper_organization_id: number;
		// ... 기타 Organization 필드들
	}>;
}
```

### `GET /api/organizations/groups`

```typescript
// RequestDto
interface GetGroupsRequest {
	// Query params
	gookId: number;
}

// ResponseDto
interface GetGroupsResponse {
	data: Array<{
		// Organization 모델 객체들 (그룹 레벨)
		id: number;
		organization_name: string;
		organization_code: string;
		upper_organization_id: number;
		// ... 기타 Organization 필드들
	}>;
}
```

### `GET /api/organizations/groups/members`

```typescript
// RequestDto
interface GetGroupMembersRequest {
	// Query params
	groupId: number;
}

// ResponseDto
interface GetGroupMembersResponse {
	data: Array<{
		// Organization + members
		id: number;
		organization_name: string;
		organization_code: string;
		// ... 기타 Organization 필드들
		members: Array<{
			id: number; // user_id
			name: string;
			email: string;
			phoneNumber: string;
			role: string; // role_name
		}>;
	}>;
}
```

### `GET /api/organizations/:id/members`

```typescript
// RequestDto
interface GetOrganizationMembersRequest {
	// Path params
	id: string;
}

// ResponseDto
interface GetOrganizationMembersResponse {
	members: Array<{
		id: number; // User.id
		name: string;
		email: string;
		roleId: number;
		roleName: string;
		roleStartDate: string;
		roleEndDate: string;
	}>;
}
```

### `GET /api/organizations/:id/activities`

```typescript
// RequestDto
interface GetOrganizationActivitiesRequest {
	// Path params
	id: string;
}

// ResponseDto
interface GetOrganizationActivitiesResponse {
	organizationId: number;
	organizationName: string;
	activities: Array<{
		id: number;
		name: string;
		description: string;
		category: string | null;
		instances: Array<{
			id: number;
			activity_id: number;
			parent_instance_id: number;
			start_datetime: string;
			end_datetime: string;
			actual_location: string;
			actual_online_link: string;
			notes: string;
			attendance_count: number;
			is_canceled: boolean;
			created_at: string;
			updated_at: string;
			creator_id: number;
			updater_id: number;
			attendances: Array<{
				userId: number;
				userName: string;
				userEmail: string;
				userPhoneNumber: string;
				status: string | null;
				check_in_time: string;
				check_out_time: string;
				note: string;
			}>;
			images: Array<{
				id: number;
				fileName: string;
				filePath: string;
				fileType: string;
				fileSize: number;
			}>;
		}>;
	}>;
}
```

---

## 🎯 **Activities APIs**

### `POST /api/activities`

```typescript
// RequestDto
interface CreateActivityRequest {
	name: string;
	activity_category_id: number;
	organization_id: number;
	location_type: "OFFLINE" | "ONLINE" | "HYBRID";
	location?: string;
	online_link?: string;
	default_start_time: string;
	default_end_time: string;
	is_deleted?: "Y" | "N";
	// ... 기타 Activity 필드들
}

// ResponseDto
interface CreateActivityResponse {
	data: {
		// Activity 모델 객체
		id: number;
		name: string;
		activity_category_id: number;
		organization_id: number;
		location_type: string;
		location: string;
		online_link: string;
		default_start_time: string;
		default_end_time: string;
		// ... 기타 모든 Activity 필드들
	};
}
```

### `GET /api/activities`

```typescript
// RequestDto: 없음

// ResponseDto
interface FindActivitiesResponse {
	data: Array<{
		// Activity 모델의 모든 필드들
		id: number;
		name: string;
		activity_category_id: number;
		organization_id: number;
		// ... 기타 모든 Activity 필드들
	}>;
}
```

### `GET /api/activities/:id`

```typescript
// RequestDto
interface FindActivityRequest {
	// Path params
	id: string;
}

// ResponseDto
interface FindActivityResponse {
	data: {
		// Activity 모델 객체
		id: number;
		name: string;
		activity_category_id: number;
		organization_id: number;
		// ... 기타 모든 Activity 필드들
	};
}
```

### `PUT /api/activities`

```typescript
// RequestDto
interface UpdateActivityRequest {
	id: number;
	name?: string;
	activity_category_id?: number;
	location_type?: "OFFLINE" | "ONLINE" | "HYBRID";
	location?: string;
	online_link?: string;
	// ... 기타 업데이트 가능한 필드들
}

// ResponseDto
interface UpdateActivityResponse {
	// 업데이트된 행 수
	[0]: number;
}
```

### `DELETE /api/activities`

```typescript
// RequestDto
interface DeleteActivityRequest {
	id: number;
}

// ResponseDto
interface DeleteActivityResponse {
	// 삭제된 행 수
	[0]: number;
}
```

---

## 🎭 **Domain Controllers**

### `GET /api/current-members`

```typescript
// RequestDto
interface GetCurrentMembersRequest {
	// Query params
	organizationId: number;
}

// ResponseDto
interface GetCurrentMembersResponse {
	data: Array<{
		userId: number;
		name: string;
		nameSuffix: string;
		email: string;
		genderType: string;
		birthDate: string;
		address: string;
		addressDetail: string;
		city: string;
		stateProvince: string;
		country: string;
		zipPostalCode: string;
		isAddressPublic: boolean;
		snsUrl: string;
		hobby: string;
		phoneNumber: string;
		isPhoneNumberPublic: boolean;
		churchMemberNumber: string;
		churchRegistrationDate: string;
		isNewMember: string;
		isLongTermAbsentee: boolean;
		isKakaotalkChatMember: boolean;
		roleId: number;
		roleName: string;
	}>;
}
```

### `POST /api/current-members`

```typescript
// RequestDto
interface CreateCurrentMemberRequest {
	userData: {
		name: string;
		name_suffix?: string;
		gender_type?: string;
		birth_date?: string;
		country?: string;
		phone_number: string;
		church_registration_date?: string;
		is_new_member?: string;
	};
	organizationId: number;
	idOfCreatingUser: number;
}

// ResponseDto
interface CreateCurrentMemberResponse {
	// User 모델 객체
	id: number;
	name: string;
	name_suffix: string;
	gender_type: string;
	birth_date: string;
	country: string;
	phone_number: string;
	church_registration_date: string;
	is_new_member: string;
	creator_id: number;
	updater_id: number;
	creator_ip: string;
	updater_ip: string;
	created_at: string;
	updated_at: string;
	// ... 기타 User 모델 필드들
}
```

### `POST /api/coramdeo/members`

```typescript
// RequestDto: CoramdeoController.updateCoramdeoMember 구현 필요

// ResponseDto: CoramdeoController.updateCoramdeoMember 구현 필요
```

### `POST /api/coramdeo/activities`

```typescript
// RequestDto: CoramdeoController.initCoramdeoActivities 구현 필요

// ResponseDto: CoramdeoController.initCoramdeoActivities 구현 필요
```

---

## 📝 **주요 특징 및 주의사항**

1. **날짜 필드**: 대부분 string으로 반환 (ISO 형식 추정)
2. **Boolean 필드**: DB에서 "Y"/"N" 문자열로 저장되는 경우 많음
3. **Enum 필드**: location_type, gender_type 등은 특정 값들만 허용
4. **중첩 구조**: Organizations 관련 API들이 복잡한 중첩 구조를 가짐
5. **동적 필드**: `...model.toJSON()` 사용으로 인한 동적 속성들
6. **외부 의존성**: 인증 관련 API는 외부 서버와 통신

이 DTO 구조를 참고해서 DB 구조 변경 후에도 동일한 API 동작을 보장할 수 있을 것 같습니다!
