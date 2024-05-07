import { SignupScreen } from "@nook/app/features/signup/signup-screen";
import { PageNavigation } from "../../components/PageNavigation";
import { NavigationHeader } from "../../components/NavigationHeader";

export default function Signup() {
  return (
    <PageNavigation>
      <NavigationHeader title="Signup for a new account" />
      <SignupScreen />
    </PageNavigation>
  );
}
