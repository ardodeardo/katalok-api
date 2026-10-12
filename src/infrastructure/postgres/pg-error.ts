export const pgErrorStatus = (code: string) => {
  switch (code) {
    // conflict
    case "23505": // unique violation
    case "23503": // foreign key violation
    case "23P01": // exclusion violation
      return 409;

    // invalid client data
    case "23502": // not null violation
    case "23514": // check violation
    case "22P02": // invalid text representation (uuid, enum, number)
    case "22001": // string data too long
    case "22003": // numeric value out of range
    case "22007": // invalid datetime format
      return 400;

    // transient, client may retry
    case "40001": // serialization failure
    case "40P01": // deadlock detected
    case "53300": // too many connections
      return 503;

    // query took too long
    case "57014": // query canceled / statement timeout
      return 504;

    default:
      // class 08 = connection exception
      if (code.startsWith("08")) return 503;
      // includes 42P01 (undefined table) and 42703 (undefined column): code or migration bug
      return 500;
  }
};
