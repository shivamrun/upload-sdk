import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { appName, gitConfig } from "./shared";

function BrandTitle() {
  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/upload-sdk.svg"
        alt=""
        width={20}
        height={20}
        aria-hidden="true"
      />
      <span>{appName}</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: <BrandTitle />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
