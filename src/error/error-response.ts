
type ErrorType = "INVALID_QUERY_STATEMENTS" | "FAILED_AUTHENTICATION" | "UNAUTHORIZATION"

export type ErrorResponse = {
  errors: [
    {
      message: string,
      error: ErrorType
    }
  ]
}
