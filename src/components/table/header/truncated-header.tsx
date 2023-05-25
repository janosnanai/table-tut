import { Typography } from "@mui/material";

interface TruncatedHeaderProps {
  maxWidth: number;
  children: React.ReactNode;
}

function TruncatedHeader({ maxWidth, children }: TruncatedHeaderProps) {
  return (
    <Typography
      variant="body1"
      sx={{
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        maxWidth,
      }}
    >
      {children}
    </Typography>
  );
}

export default TruncatedHeader;
