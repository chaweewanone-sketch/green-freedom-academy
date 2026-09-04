type GfaWorldLeadTitlesProps = {
  worldTitle: string;
  lessonTitle: string;
  teachingTitle: string;
  nowrapWorldName?: boolean;
};

export function GfaWorldLeadTitles({
  worldTitle,
  lessonTitle,
  teachingTitle,
  nowrapWorldName = false,
}: GfaWorldLeadTitlesProps) {
  const worldName = nowrapWorldName ? (
    <span className="gfaClubPlace">{worldTitle}</span>
  ) : (
    worldTitle
  );

  return (
    <>
      <p className="gfaGardenKicker">LEARN / เรียนรู้ · {worldName}</p>
      <h1 className="gfaGardenTitle">{lessonTitle}</h1>
      <h2 className="gfaGardenSection" tabIndex={-1}>
        {worldName}
      </h2>
      <p className="gfaGardenTeachingTitle">{teachingTitle}</p>
    </>
  );
}
