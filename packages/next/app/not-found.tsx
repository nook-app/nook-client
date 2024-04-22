"use client";

import { PageNavigation } from "../components/PageNavigation";
import { ErrorMessage } from "@nook/app/components/error-message";

export default function NotFound() {
  return (
    <PageNavigation>
      <ErrorMessage>Page not found</ErrorMessage>
    </PageNavigation>
  );
}
