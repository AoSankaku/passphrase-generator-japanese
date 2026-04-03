import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import MuiInput from "@mui/material/Input";

const MIN_WORD_COUNT = 1;
const MAX_WORD_COUNT = 10;

type WordCountSliderProps = {
  title: string;
  value: number;
  onChange: (value: number) => void;
};

const WordCountSlider: React.FC<WordCountSliderProps> = ({
  title,
  value,
  onChange,
}) => {
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(
      event.target.value === "" ? MIN_WORD_COUNT : Number(event.target.value),
    );
  };

  const handleBlur = () => {
    if (value < MIN_WORD_COUNT) onChange(MIN_WORD_COUNT);
    else if (value > MAX_WORD_COUNT) onChange(MAX_WORD_COUNT);
  };

  return (
    <Box sx={{ width: 250 }}>
      <Typography id="input-slider" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2} sx={{ alignItems: "center" }}>
        <Grid size="grow">
          <Slider
            value={value}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            min={MIN_WORD_COUNT}
            max={MAX_WORD_COUNT}
            step={1}
          />
        </Grid>
        <Grid>
          <MuiInput
            value={value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            sx={{ width: "42px" }}
            inputProps={{
              step: 1,
              min: MIN_WORD_COUNT,
              max: MAX_WORD_COUNT,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WordCountSlider;
