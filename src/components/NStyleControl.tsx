import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { NStyle } from "../lib/romajiMappings";

type NStyleControlProps = {
  value: NStyle;
  onChange: (style: NStyle) => void;
};

const OPTIONS: { value: NStyle; label: string; example: string }[] = [
  { value: "apostrophe", label: "n'", example: "kan'yuu" },
  { value: "double-n", label: "nn", example: "kannyuu" },
  { value: "force-nn", label: "常にnn", example: "bonngo" },
];

const NStyleControl: React.FC<NStyleControlProps> = ({ value, onChange }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography variant="body2">ん の表記</Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, val) => val !== null && onChange(val as NStyle)}
        size="small"
      >
        {OPTIONS.map((o) => (
          <ToggleButton key={o.value} value={o.value}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              <Typography variant="caption" fontWeight="bold" lineHeight={1.2}>
                {o.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}
                lineHeight={1.2}
              >
                {o.example}
              </Typography>
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default NStyleControl;
