export interface HostPolicy {
  version: string
  minimumProgrammeDurationSeconds: number
  maximumProgrammeDurationSeconds: number
  minimumTracksBetweenInterludes: number
  maximumTracksBetweenInterludes: number
}

export const HOST_POLICY_V1: Readonly<HostPolicy> = Object.freeze({
  version: '1',
  minimumProgrammeDurationSeconds: 30 * 60,
  maximumProgrammeDurationSeconds: 45 * 60,
  minimumTracksBetweenInterludes: 2,
  maximumTracksBetweenInterludes: 3,
})
