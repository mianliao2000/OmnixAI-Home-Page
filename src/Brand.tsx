export function OrbitalBrandLogo({
  iconOnly = false,
  surface = "auto",
}: {
  iconOnly?: boolean;
  surface?: "auto" | "light" | "dark";
}) {
  const wrapperClass = `${iconOnly ? "orbitalBrandIcon" : "orbitalBrandWordmark"} omnixBrandSurface-${surface}`;
  const lightAsset = iconOnly ? "/omnix-o-light.png" : "/omnix-wordmark-light.png";
  const darkAsset = iconOnly ? "/omnix-o-dark.png" : "/omnix-wordmark-dark.png";

  return (
    <span className={wrapperClass} role="img" aria-label={iconOnly ? "Omnix O logo" : "Omnix AI"}>
      <img className="omnixBrandAsset omnixBrandAsset-light" src={lightAsset} alt="" aria-hidden="true" />
      <img className="omnixBrandAsset omnixBrandAsset-dark" src={darkAsset} alt="" aria-hidden="true" />
    </span>
  );
}
