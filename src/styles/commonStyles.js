// 📁 admin-web/src/styles/commonStyles.js
import { Colors } from '../utils/colors';

export const pageSx = {
  padding: { xs: 2, md: 3 },
  backgroundColor: Colors.background,
  minHeight: '100vh',
};

export const pageHeaderSx = {
  display: 'flex',
  alignItems: { xs: 'flex-start', sm: 'center' },
  justifyContent: 'space-between',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  mb: 3,
};

export const pageTitleSx = {
  fontSize: { xs: 22, md: 26 },
  fontWeight: 700,
  color: Colors.textPrimary,
};

export const pageSubtitleSx = {
  fontSize: 14,
  color: Colors.textSecondary,
  mt: 0.5,
};

export const cardSx = {
  backgroundColor: Colors.surface,
  border: `1px solid ${Colors.border}`,
  borderRadius: 12,
  boxShadow: Colors.shadow.md,
  p: 3,
};

export const statCardSx = {
  ...cardSx,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: Colors.shadow.lg,
  },
};

export const toolbarSx = {
  ...cardSx,
  p: 2,
  mb: 3,
  display: 'flex',
  gap: 2,
  alignItems: 'center',
  flexWrap: 'wrap',
};

export const tableWrapSx = {
  ...cardSx,
  p: 0,
  overflow: 'hidden',
};

export const statusPillSx = (bg, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  px: 1.25,
  py: 0.25,
  borderRadius: '999px',
  fontSize: 12,
  fontWeight: 600,
  backgroundColor: bg,
  color,
});