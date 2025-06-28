import { ValidationError } from "./errors"

const BASE = '코람데오'

const getOrganizationNamePattern = (gook, group, soon) => {
  if (!gook) {
    throw new ValidationError("gook must be provided.")
  }

  if (!group) {
    return `${BASE}_${gook}국`
  }

  if (!soon) {
    return `${BASE}_${gook}국_${group}그룹`
  }

  return `${BASE}_${gook}국_${group}그룹_${soon}순`
}

export { getOrganizationNamePattern }
