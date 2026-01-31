export function serializeUser(u: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
  };
}
