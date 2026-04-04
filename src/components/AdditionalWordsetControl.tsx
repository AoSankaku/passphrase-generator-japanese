import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type AdditionalWordsetOption = {
  id: string;
  title: string;
  description: string;
  note: string;
  count: number;
  badge: string;
};

type AdditionalWordsetControlProps = {
  options: AdditionalWordsetOption[];
  selectedIds: string[];
  onChange: (nextSelectedIds: string[]) => void;
};

const AdditionalWordsetControl = ({
  options,
  selectedIds,
  onChange,
}: AdditionalWordsetControlProps) => {
  const handleToggle = (id: string) => {
    const isSelected = selectedIds.includes(id);
    if (isSelected) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      <Stack spacing={0.75}>
        <Typography variant="subtitle2">追加ワードセット</Typography>
        <Typography variant="body2" color="text.secondary">
          地名や分野語は便利ですが、デフォルト語彙より意味推測しづらい語を含む場合があります。
        </Typography>
      </Stack>
      <Stack spacing={1}>
        {options.map((option) => (
          <Stack
            key={option.id}
            spacing={0.5}
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 2,
              border: "1px solid",
              borderColor: selectedIds.includes(option.id)
                ? "primary.main"
                : "divider",
              backgroundColor: selectedIds.includes(option.id)
                ? "action.selected"
                : "background.paper",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedIds.includes(option.id)}
                    onChange={() => handleToggle(option.id)}
                  />
                }
                label={option.title}
                sx={{ mr: 0 }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={option.badge} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  {option.count}語
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {option.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.note}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default AdditionalWordsetControl;
