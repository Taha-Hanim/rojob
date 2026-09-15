/**
 * Firebase surfaces most sign-in failures as `auth/invalid-credential`: with email
 * enumeration protection enabled (the default on new projects) a wrong password and
 * an unknown account are deliberately indistinguishable. Translate the codes into
 * something a customer can act on.
 */
const MESSAGES = {
  en: {
    "auth/invalid-credential":
      "Email or password is incorrect. If you have not created an account yet, use “Create account” below.",
    "auth/invalid-login-credentials":
      "Email or password is incorrect. If you have not created an account yet, use “Create account” below.",
    "auth/wrong-password": "That password is incorrect. Try again or reset it below.",
    "auth/user-not-found": "No account exists for this email. Use “Create account” below.",
    "auth/invalid-email": "That email address does not look valid.",
    "auth/user-disabled": "This account has been disabled. Contact contact@rojob.eu.",
    "auth/email-already-in-use": "An account already exists for this email. Sign in instead.",
    "auth/weak-password": "Choose a password of at least six characters.",
    "auth/missing-password": "Enter your password.",
    "auth/too-many-requests":
      "Too many attempts. Wait a few minutes or reset your password before trying again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed":
      "Email and password sign-in is not enabled for this site yet. Contact contact@rojob.eu.",
    "auth/unauthorized-domain":
      "This domain is not authorised for sign-in. Contact contact@rojob.eu.",
    "auth/api-key-not-valid": "Sign-in is misconfigured on this site. Contact contact@rojob.eu.",
    default: "Sign-in failed. Please try again.",
  },
  pl: {
    "auth/invalid-credential":
      "Nieprawidłowy e-mail lub hasło. Jeśli nie masz jeszcze konta, wybierz „Załóż konto” poniżej.",
    "auth/invalid-login-credentials":
      "Nieprawidłowy e-mail lub hasło. Jeśli nie masz jeszcze konta, wybierz „Załóż konto” poniżej.",
    "auth/wrong-password": "Hasło jest nieprawidłowe. Spróbuj ponownie lub zresetuj je poniżej.",
    "auth/user-not-found": "Nie ma konta dla tego adresu e-mail. Wybierz „Załóż konto” poniżej.",
    "auth/invalid-email": "Ten adres e-mail wygląda na nieprawidłowy.",
    "auth/user-disabled": "To konto zostało zablokowane. Napisz na contact@rojob.eu.",
    "auth/email-already-in-use": "Konto dla tego e-maila już istnieje. Zaloguj się.",
    "auth/weak-password": "Wybierz hasło o długości co najmniej sześciu znaków.",
    "auth/missing-password": "Podaj hasło.",
    "auth/too-many-requests":
      "Zbyt wiele prób. Odczekaj kilka minut lub zresetuj hasło przed kolejną próbą.",
    "auth/network-request-failed": "Błąd sieci. Sprawdź połączenie i spróbuj ponownie.",
    "auth/operation-not-allowed":
      "Logowanie e-mailem i hasłem nie jest jeszcze włączone. Napisz na contact@rojob.eu.",
    "auth/unauthorized-domain":
      "Ta domena nie jest autoryzowana do logowania. Napisz na contact@rojob.eu.",
    "auth/api-key-not-valid": "Logowanie jest źle skonfigurowane. Napisz na contact@rojob.eu.",
    default: "Logowanie nie powiodło się. Spróbuj ponownie.",
  },
};

export function authErrorMessage(error, lang = "en") {
  const dict = MESSAGES[lang] || MESSAGES.en;
  const code = error?.code || "";
  if (dict[code]) return dict[code];
  // Some SDK errors only carry the code inside the message string.
  const match = /auth\/[a-z-]+/.exec(error?.message || "");
  if (match && dict[match[0]]) return dict[match[0]];
  return dict.default;
}
