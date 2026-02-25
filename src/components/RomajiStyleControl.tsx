import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { RomajiStyle } from "../lib/romajiMappings";

type RomajiStyleControlProps = {
  value: RomajiStyle;
  onChange: (style: RomajiStyle) => void;
};

const STYLES: { value: RomajiStyle; label: string; example: string }[] = [
  { value: "hepburn", label: "ヘボン式", example: "shi·chi·tsu·fu" },
  { value: "nihon", label: "日本式", example: "si·ti·tu·hu" },
  { value: "kunrei", label: "訓令式", example: "si·ti·tu·fu" },
];

const RomajiStyleControl: React.FC<RomajiStyleControlProps> = ({
  value,
  onChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography variant="body2">ローマ字表記</Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, val) => val !== null && onChange(val as RomajiStyle)}
        size="small"
      >
        {STYLES.map((s) => (
          <ToggleButton key={s.value} value={s.value}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              <Typography variant="caption" fontWeight="bold" lineHeight={1.2}>
                {s.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}
                lineHeight={1.2}
              >
                {s.example}
              </Typography>
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default RomajiStyleControl;
