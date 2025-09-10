import { ValidationError } from "./errors.js"

const getOrganizationNamePattern = (gook, group, soon) => {
  if (!gook) {
    throw new ValidationError("gook must be provided.")
  }

  if (!group) {
    return `${gook}국`
  }

  if (!soon) {
    return `${gook}국_${group}그룹`
  }

  return `${gook}국_${group}그룹_${soon}순`
}

export { getOrganizationNamePattern }
