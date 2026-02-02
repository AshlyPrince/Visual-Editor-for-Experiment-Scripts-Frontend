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

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ fontSize: 24 }}>🔒</Box>
                <Typography variant="subtitle1">{t('help.sharingPermissions', 'Sharing & Permissions')}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph fontWeight="bold">
                {t('help.sharingPermissionsDesc', 'Control who can access your experiments with three visibility modes:')}
              </Typography>
              
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="error.main" gutterBottom>
                  🔴 Private Mode
                </Typography>
                <Typography variant="body2">
                  • Only you (the creator) can view and edit this experiment
                </Typography>
                <Typography variant="body2">
                  • Perfect for drafts or personal experiments
                </Typography>
                <Typography variant="body2">
                  • Others cannot see it in their dashboard
                </Typography>
              </Box>

              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="success.main" gutterBottom>
                  🟢 Public Mode
                </Typography>
                <Typography variant="body2">
                  • Everyone can view, edit, export, and access all features
                </Typography>
                <Typography variant="body2">
                  • Great for open-source educational content
                </Typography>
                <Typography variant="body2">
                  • Full collaboration access for all users
                </Typography>
              </Box>

              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="warning.main" gutterBottom>
                  🟡 Restricted Mode (Granular Control)
                </Typography>
                <Typography variant="body2" paragraph>
                  • You control exactly what others can do with your experiment
                </Typography>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  You can enable/disable each feature individually:
                </Typography>
                <List dense sx={{ ml: 2 }}>
                  <ListItem><ListItemText primary="✓ View Experiment Details - Let others read your experiment" /></ListItem>
                  <ListItem><ListItemText primary="✓ Edit Experiment - Allow others to make changes" /></ListItem>
                  <ListItem><ListItemText primary="✓ Export Experiment - Enable PDF/HTML downloads" /></ListItem>
                  <ListItem><ListItemText primary="✓ Access Version History - Show past versions" /></ListItem>
                  <ListItem><ListItemText primary="✓ Simplify Language - Allow AI language simplification" /></ListItem>
                  <ListItem><ListItemText primary="✓ Delete Experiment - Permit deletion (use carefully!)" /></ListItem>
                </List>
                
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
                  <Typography variant="body2" fontWeight="bold" color="info.main" gutterBottom>
                    👁️ What Users See When Features Are Disabled:
                  </Typography>
                  <Typography variant="body2">
                    • Disabled buttons appear <strong>grayed out</strong> (not clickable)
                  </Typography>
                  <Typography variant="body2">
                    • A <strong>blue info banner</strong> appears at the top explaining restrictions
                  </Typography>
                  <Typography variant="body2">
                    • Hovering over disabled buttons shows a <strong>tooltip</strong>: "This feature has been restricted by the experiment creator"
                  </Typography>
                  <Typography variant="body2">
                    • Users can still see what features exist, they just can't use them
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    💡 This design helps users understand WHY they can't access certain features!
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" paragraph fontWeight="bold" color="primary.main">
                💡 How to Set Permissions:
              </Typography>
              <Typography variant="body2">
                1. While creating a new experiment, go to "Sharing & Access" step
              </Typography>
              <Typography variant="body2">
                2. Choose Private, Public, or Restricted
              </Typography>
              <Typography variant="body2">
                3. If Restricted, check the features you want to allow
              </Typography>
              <Typography variant="body2">
                4. Save - permissions apply immediately
              </Typography>

              <Typography variant="body2" paragraph fontWeight="bold" color="info.main" sx={{ mt: 2 }}>
                ⚠️ Important Notes:
              </Typography>
              <Typography variant="body2">
                • You (as creator) ALWAYS have full access regardless of settings
              </Typography>
              <Typography variant="body2">
                • Restricted users will see disabled buttons for features they cannot access
              </Typography>
              <Typography variant="body2">
                • You can change permissions anytime by editing the experiment
              </Typography>
              <Typography variant="body2">
                • Permissions ensure your work is shared the way YOU want
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ fontSize: 24 }}>🤖</Box>
                <Typography variant="subtitle1">{t('help.aiAssistant', 'AI Assistant & Smart Features')}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph fontWeight="bold">
                {t('help.aiAssistantDesc', 'Your intelligent co-pilot for creating better experiments:')}
              </Typography>
              
              <Box sx={{ mb: 2, p: 2, bgcolor: 'blue.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                  💬 Context-Aware AI Chat
                </Typography>
                <Typography variant="body2">
                  • Click the chat button (bottom-right corner) to open AI assistant
                </Typography>
                <Typography variant="body2">
                  • AI understands YOUR experiment context - gives personalized advice
                </Typography>
                <Typography variant="body2">
                  • Ask anything: "What's missing?", "Improve my objectives", "Is this safe?"
                </Typography>
                <Typography variant="body2">
                  • Get suggestions for missing sections, safety improvements, clarity
                </Typography>
              </Box>

              <Box sx={{ mb: 2, p: 2, bgcolor: 'green.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="success.main" gutterBottom>
                  ✨ Text Polisher (Smart Improvement)
                </Typography>
                <Typography variant="body2">
                  • Available in rich text editor sections
                </Typography>
                <Typography variant="body2">
                  • Automatically improves grammar, clarity, and professional tone
                </Typography>
                <Typography variant="body2">
                  • Select text → Click "Polish Text" → Review → Accept changes
                </Typography>
                <Typography variant="body2">
                  • Perfect for making instructions clearer for students
                </Typography>
              </Box>

              <Box sx={{ mb: 2, p: 2, bgcolor: 'purple.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="secondary.main" gutterBottom>
                  📝 Language Simplification
                </Typography>
                <Typography variant="body2">
                  • Simplify complex scientific language for younger students
                </Typography>
                <Typography variant="body2">
                  • Choose target grade level (e.g., Grade 7, Grade 10)
                </Typography>
                <Typography variant="body2">
                  • AI rewrites content to match comprehension level
                </Typography>
                <Typography variant="body2">
                  • Access from experiment menu → "Simplify Language"
                </Typography>
              </Box>

              <Box sx={{ mb: 2, p: 2, bgcolor: 'orange.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="warning.main" gutterBottom>
                  ✅ Content Review & Consistency Check
                </Typography>
                <Typography variant="body2">
                  • Automatic validation of experiment completeness
                </Typography>
                <Typography variant="body2">
                  • Checks for missing required fields (title, procedure, safety)
                </Typography>
                <Typography variant="body2">
                  • Reviews structure consistency across sections
                </Typography>
                <Typography variant="body2">
                  • Click "Review Content" button to get detailed report with suggestions
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ fontSize: 24 }}>💾</Box>
                <Typography variant="subtitle1">{t('help.draftManagement', 'Draft Management')}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.draftManagementDesc', 'Never lose your work with automatic draft saving:')}
              </Typography>
              <List dense>
                <ListItem><ListItemText primary="• Your work is automatically saved as a draft while creating" /></ListItem>
                <ListItem><ListItemText primary="• If you leave without saving, your draft is preserved" /></ListItem>
                <ListItem><ListItemText primary="• Return to dashboard - 'Create New Experiment' button becomes 'Continue Draft'" /></ListItem>
                <ListItem><ListItemText primary="• Click 'Continue Draft' to resume where you left off" /></ListItem>
                <ListItem><ListItemText primary="• Draft is cleared only when you save the final experiment" /></ListItem>
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
              💡 {t('help.tip2Title', 'Use Draft Auto-Save Feature')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tip2Desc', 'If you need to leave while creating an experiment, just close the wizard. Your draft is automatically saved and you can continue later by clicking "Continue Draft" on the dashboard.')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tipPermissions', 'Choose the Right Permission Setting')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tipPermissionsDesc', 'Start with Private mode for work-in-progress experiments. Switch to Public when ready to share openly, or use Restricted mode to control specific features. Remember: you can always change permissions later!')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tipAI', 'Leverage AI Assistant Effectively')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tipAIDesc', 'The AI assistant knows YOUR experiment context. Ask specific questions like "What safety measures should I add for sodium hydroxide?" instead of generic questions. The more specific you are, the better the suggestions!')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💡 {t('help.tipReview', 'Use Content Review Before Sharing')}
            </Typography>
            <Typography variant="body2" paragraph>
              {t('help.tipReviewDesc', 'Always run the Content Review feature before exporting or sharing. It catches missing sections, incomplete safety information, and inconsistencies that you might have missed.')}
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

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q9', 'How do I control who can access my experiment?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.a9', 'During experiment creation, go to the "Sharing & Access" step. Choose from three options:')}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Private:</strong> Only you can access the experiment
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Public:</strong> Everyone has full access to all features
              </Typography>
              <Typography variant="body2">
                <strong>Restricted:</strong> You select specific features others can use (view, edit, export, version history, simplify language, delete)
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q10', 'What happens if I set my experiment to Restricted?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.a10', 'Other users will see disabled (grayed out) buttons for features you haven\'t allowed. For example, if you disable "Edit", they can view but cannot modify the experiment. You always have full access as the creator.')}
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="info.main">
                Visual Indicators for Users:
              </Typography>
              <Typography variant="body2">
                • Blue info banner at top: "This experiment has restricted access"
              </Typography>
              <Typography variant="body2">
                • Grayed-out buttons that can't be clicked
              </Typography>
              <Typography variant="body2">
                • Tooltip on hover explaining the restriction
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q10b', 'Why are some buttons grayed out when I view an experiment?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                {t('help.a10b', 'Grayed-out (disabled) buttons mean the experiment creator has restricted that feature. This is intentional - they want you to view the experiment but not use certain features like editing, exporting, or deleting.')}
              </Typography>
              <Typography variant="body2" paragraph fontWeight="bold">
                How to understand restrictions:
              </Typography>
              <Typography variant="body2">
                1. Look for the blue info banner at the top explaining restrictions
              </Typography>
              <Typography variant="body2">
                2. Hover over any disabled button to see a tooltip
              </Typography>
              <Typography variant="body2">
                3. The tooltip says: "This feature has been restricted by the experiment creator"
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                💡 If you need access to a restricted feature, contact the experiment creator directly.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q11', 'How do I use the AI Assistant?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a11', 'Click the chat icon in the bottom-right corner while creating or editing an experiment. The AI knows your experiment context and can answer questions, suggest improvements, or help with missing sections. Try asking: "What\'s missing in my experiment?" or "Help me improve the safety section."')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q12', 'What is Text Polisher and how do I use it?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a12', 'Text Polisher uses AI to improve your writing. In any rich text editor section, select text and click the "Polish Text" button. The AI will improve grammar, clarity, and professional tone. Review the suggestions and accept if satisfied.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q13', 'Can I simplify my experiment for younger students?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a13', 'Yes! Open your experiment, click the menu (three dots), and select "Simplify Language". Choose the target grade level, and AI will rewrite the content to match that comprehension level. This creates a new version, so your original is preserved.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q14', 'What if I accidentally close the experiment wizard?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a14', 'Don\'t worry! Your work is automatically saved as a draft. Return to the dashboard, and the "Create New Experiment" button will show "Continue Draft". Click it to resume exactly where you left off.')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                {t('help.q15', 'How do I check if my experiment is complete?')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {t('help.a15', 'Click the "Review Content" button in the wizard or experiment editor. The system will check for missing fields, incomplete sections, and consistency issues. You\'ll get a detailed report with suggestions for improvements.')}
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
