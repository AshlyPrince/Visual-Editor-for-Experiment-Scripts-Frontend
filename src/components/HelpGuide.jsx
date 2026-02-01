import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider
} from '@mui/material';
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as StartIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  FileDownload as ExportIcon,
  Science as ExperimentIcon,
  Add as AddIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HelpGuide = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <HelpIcon color="primary" />
          <Typography variant="h5">{t('help.title', 'User Guide & Help')}</Typography>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="help tabs">
          <Tab label={t('help.gettingStarted', 'Getting Started')} />
          <Tab label={t('help.features', 'Features')} />
          <Tab label={t('help.tips', 'Tips & Tricks')} />
          <Tab label={t('help.faq', 'FAQ')} />
        </Tabs>
      </Box>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom color="primary">
            {t('help.welcome', 'Welcome to Visual Editor for Experiment Scripts!')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('help.welcomeText', 'This platform helps you create, edit, and share detailed experiment scripts for educational purposes.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('help.quickStart', 'Quick Start Guide')}
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Chip label="1" color="primary" size="small" />
              </ListItemIcon>
              <ListItemText
                primary={t('help.step1Title', 'Create a New Experiment')}
                secondary={t('help.step1Desc', 'Click "Create New Experiment" button on the dashboard.')}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Chip label="2" color="primary" size="small" />
              </ListItemIcon>
              <ListItemText
                primary={t('help.step2Title', 'Fill in Basic Information')}
                secondary={t('help.step2Desc', 'Enter experiment title, description, and select relevant sections (materials, procedure, safety, etc.).')}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Chip label="3" color="primary" size="small" />
              </ListItemIcon>
              <ListItemText
                primary={t('help.step3Title', 'Add Content to Sections')}
                secondary={t('help.step3Desc', 'Fill each section with text, images, videos, and other media. Use the rich text editor for formatting.')}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Chip label="4" color="primary" size="small" />
              </ListItemIcon>
              <ListItemText
                primary={t('help.step4Title', 'Save and Preview')}
                secondary={t('help.step4Desc', 'Save your work regularly. Use the preview button to see how your experiment will look.')}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Chip label="5" color="primary" size="small" />
              </ListItemIcon>
              <ListItemText
                primary={t('help.step5Title', 'Export or Share')}
                secondary={t('help.step5Desc', 'Export your experiment as PDF or HTML to share with students or colleagues.')}
              />
            </ListItem>
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom color="primary">
            {t('help.keyFeatures', 'Key Features')}
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <ExperimentIcon color="primary" />
                <Typography variant="subtitle1">{t('help.experimentCreation', 'Experiment Creation')}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.experimentCreationDesc', 'Create comprehensive experiment scripts with multiple sections:')}
              </Typography>
              <List dense>
                <ListItem><ListItemText primary="• Materials & Equipment" /></ListItem>
                <ListItem><ListItemText primary="• Chemicals & Reagents" /></ListItem>
                <ListItem><ListItemText primary="• Step-by-Step Procedure" /></ListItem>
                <ListItem><ListItemText primary="• Safety Measures" /></ListItem>
                <ListItem><ListItemText primary="• Theoretical Background" /></ListItem>
                <ListItem><ListItemText primary="• Expected Results" /></ListItem>
                <ListItem><ListItemText primary="• Custom Sections" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <ImageIcon color="primary" />
                <Typography variant="subtitle1">{t('help.mediaSupport', 'Media Support')}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.mediaSupportDesc', 'Add visual aids to enhance understanding:')}
              </Typography>
              <List dense>
                <ListItem><ListItemText primary="• Upload images (diagrams, photos, illustrations)" /></ListItem>
                <ListItem><ListItemText primary="• Add videos (demonstrations, tutorials)" /></ListItem>
                <ListItem><ListItemText primary="• Safety icons and hazard symbols" /></ListItem>
                <ListItem><ListItemText primary="• Captions and descriptions for all media" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <EditIcon color="primary" />
                <Typography variant="subtitle1">{t('help.richTextEditor', 'Rich Text Editor')}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.richTextEditorDesc', 'Format your content with ease:')}
              </Typography>
              <List dense>
                <ListItem><ListItemText primary="• Bold, italic, underline text" /></ListItem>
                <ListItem><ListItemText primary="• Headings and subheadings" /></ListItem>
                <ListItem><ListItemText primary="• Bullet points and numbered lists" /></ListItem>
                <ListItem><ListItemText primary="• Links and references" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <SaveIcon color="primary" />
                <Typography variant="subtitle1">{t('help.versionControl', 'Version Control')}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.versionControlDesc', 'Track changes and manage versions:')}
              </Typography>
              <List dense>
                <ListItem><ListItemText primary="• Automatic version history" /></ListItem>
                <ListItem><ListItemText primary="• Compare different versions" /></ListItem>
                <ListItem><ListItemText primary="• Restore previous versions" /></ListItem>
                <ListItem><ListItemText primary="• Add version notes" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <ExportIcon color="primary" />
                <Typography variant="subtitle1">{t('help.exportOptions', 'Export Options')}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.exportOptionsDesc', 'Share your experiments in multiple formats:')}
              </Typography>
              <List dense>
                <ListItem><ListItemText primary="• PDF export for printing and offline use" /></ListItem>
                <ListItem><ListItemText primary="• HTML export for web sharing" /></ListItem>
                <ListItem><ListItemText primary="• Includes all images and media" /></ListItem>
                <ListItem><ListItemText primary="• Professional formatting" /></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom color="primary">
            {t('help.tipsAndTricks', 'Tips & Tricks')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tip1Title', 'Save Your Work Frequently')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tip1Desc', 'Click the "Save" button regularly to avoid losing your work. The system auto-saves periodically, but manual saves ensure your latest changes are preserved.')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tip2Title', 'Use Templates')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tip2Desc', 'Start with a template to save time. Templates include pre-configured sections for common experiment types.')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tip3Title', 'Add Safety Information First')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tip3Desc', 'Always include safety measures and hazard information at the beginning. This ensures students are aware of precautions before starting.')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tip4Title', 'Use Clear, Numbered Steps')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tip4Desc', 'Break down procedures into clear, numbered steps. Add notes or warnings for critical steps.')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tip5Title', 'Add Visual Aids')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tip5Desc', 'Include diagrams, photos, and videos to make complex procedures easier to understand. A picture is worth a thousand words!')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tip6Title', 'Preview Before Exporting')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tip6Desc', 'Always preview your experiment before exporting to check formatting, images, and content flow.')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tip7Title', 'Use Version History')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tip7Desc', 'Create new versions when making major changes. This allows you to track improvements and revert if needed.')}
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom color="primary">
            {t('help.frequentlyAsked', 'Frequently Asked Questions')}
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q1', 'How do I add a new section to my experiment?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a1', 'During experiment creation, you can select from predefined sections (materials, procedure, safety, etc.) or create custom sections by clicking "Add Custom Section" and entering a name.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q2', 'Can I upload my own images and videos?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a2', 'Yes! Each section has a media upload button where you can add images and videos. Supported formats include JPG, PNG, GIF for images and MP4, WebM for videos.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q3', 'How do I export my experiment as PDF?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a3', 'Open your experiment in view mode, click the "Export" button, and select "Export as PDF". The system will generate a formatted PDF including all text, images, and safety icons.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q4', 'What happens if I make a mistake?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a4', 'You can always edit your experiment and save a new version. The version history feature allows you to compare versions and restore previous ones if needed.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q5', 'Can I collaborate with others on an experiment?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a5', 'Currently, each experiment is owned by one user. However, you can export and share the HTML/PDF version with colleagues who can use it as a template for their own experiments.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q6', 'How do I add procedure steps?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a6', 'In the Procedure section, click "Add Step". Enter the step description and optionally add notes or warnings. Steps are automatically numbered. You can reorder steps by dragging them.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q7', 'Where can I find safety icons?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a7', 'In the Safety Measures section, click "Add Safety Icon" to open the icon library. You can select from GHS hazard pictograms and safety equipment icons. Selected icons will appear in your experiment.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q8', 'Can I switch languages?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a8', 'Yes! Use the language switcher in the top navigation bar to toggle between English and German. Your experiment content remains unchanged, but the interface labels will change.')}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('help.close', 'Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpGuide;
