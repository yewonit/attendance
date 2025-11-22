/**
 * 조직명 패턴 생성 함수
 * @param {string} gook - 소속국 (예: "1")
 * @param {string} group - 소속그룹 (예: "김민수")
 * @param {string} soon - 소속순 (예: "이용걸")
 * @returns {string} 조직명 (예: "1국_김민수그룹_이용걸순")
 */
const getOrganizationNamePattern = (gook, group, soon) => {
  if (!gook) {
    return ""
  }

  if (!group) {
    return `${gook}국`
  }

  if (!soon) {
    return `${gook}국_${group}그룹`
  }

  return `${gook}국_${group}그룹_${soon}순`
}

/**
 * 조직명을 소속국/소속그룹/소속순으로 파싱
 * @param {string} orgName - 조직명 (예: "1국_김민수그룹_이용걸순")
 * @returns {{department: string, group: string, team: string}} 파싱된 조직 정보
 */
const parseOrganizationName = (orgName) => {
  if (!orgName) {
    return {
      department: null,
      group: null,
      team: null
    }
  }

  const parts = orgName.split("_")
  
  return {
    department: parts[0] || null, // "1국"
    group: parts[1] || null, // "김민수그룹"
    team: parts[2] || null // "이용걸순"
  }
}

/**
 * 필터 조건으로 조직명 패턴 생성 (LIKE 쿼리용)
 * @param {string} department - 소속국 필터 (예: "1국")
 * @param {string} group - 소속그룹 필터 (예: "김민수그룹")
 * @param {string} team - 소속순 필터 (예: "이용걸순")
 * @returns {string} LIKE 패턴 (예: "1국_김민수그룹_이용걸순%")
 */
const buildOrganizationNamePattern = (department, group, team) => {
  if (!department && !group && !team) {
    return null
  }

  let pattern = ""
  
  if (department) {
    pattern = department // "1국"
  }
  
  if (group) {
    if (pattern) {
      pattern += `_${group}` // "1국_김민수그룹"
    } else {
      pattern = `%_${group}` // "%_김민수그룹"
    }
  }
  
  if (team) {
    if (pattern) {
      pattern += `_${team}` // "1국_김민수그룹_이용걸순"
    } else {
      pattern = `%_%_${team}` // "%_%_이용걸순"
    }
  }
  
  return pattern
}

export { getOrganizationNamePattern, parseOrganizationName, buildOrganizationNamePattern }
