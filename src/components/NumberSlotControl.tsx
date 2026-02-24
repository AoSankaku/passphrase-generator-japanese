import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MuiInput from '@mui/material/Input';
import styled from 'styled-components';

const Input = styled(MuiInput)`
  width: 42px;
`;

type NumberSlotControlProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  position: 'start' | 'end';
  onPositionChange: (position: 'start' | 'end') => void;
  digitCount: number;
  onDigitCountChange: (count: number) => void;
};

const NumberSlotControl: React.FC<NumberSlotControlProps> = ({
  enabled,
  onToggle,
  position,
  onPositionChange,
  digitCount,
  onDigitCountChange,
}) => {
  const handleDigitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDigitCountChange(event.target.value === '' ? 2 : Number(event.target.value));
  };

  const handleDigitBlur = () => {
    if (digitCount < 2) onDigitCountChange(2);
    else if (digitCount > 10) onDigitCountChange(10);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <FormControlLabel
        control={
          <Switch
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            size="small"
          />
        }
        label="数字スロットを追加（オススメ！）"
      />
      {enabled && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={position}
            exclusive
            onChange={(_, val) => val && onPositionChange(val)}
            size="small"
          >
            <ToggleButton value="start">先頭</ToggleButton>
            <ToggleButton value="end">末尾</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">桁数:</Typography>
            <Input
              value={digitCount}
              size="small"
              onChange={handleDigitChange}
              onBlur={handleDigitBlur}
              inputProps={{
                step: 1,
                min: 2,
                max: 10,
                type: 'number',
                'aria-label': '桁数',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NumberSlotControl;
