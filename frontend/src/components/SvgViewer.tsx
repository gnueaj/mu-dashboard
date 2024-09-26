interface Props {
  mode: 0 | 1;
  svg: string | undefined;
}

export default function SvgViewer({ mode, svg }: Props) {
  const createMarkup = (svg: string) => {
    const modifiedSvg = svg.replace(/<svg/, `<svg width="630" height="668"`);
    return { __html: modifiedSvg };
  };

  return (
    <div className="w-[630px] h-[668px]">
      {svg && (
        <div className="flex flex-col justify-center items-center">
          <img
            src={mode === 0 ? "/embedding1.png" : "/embedding2.png"}
            alt="embedding img"
          />
          {/* <div
            className="relative bottom-9 w-[630px] h-[652px] -z-10 top-0"
            dangerouslySetInnerHTML={createMarkup(svg)}
          /> */}
        </div>
      )}
    </div>
  );
}