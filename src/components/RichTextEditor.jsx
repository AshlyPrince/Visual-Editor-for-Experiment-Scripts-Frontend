import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Divider,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatColorText,
  FormatColorFill,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Undo,
  Redo,
  TableChart as TableIcon,
  AddCircleOutline,
  RemoveCircleOutline,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const RichTextEditor = ({ value = '', onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);
  const [tableCaption, setTableCaption] = useState('');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showTableToolbar, setShowTableToolbar] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [currentCell, setCurrentCell] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
  
  const { t } = useTranslation();
  
  const editorPlaceholder = placeholder || t('editor.placeholder');

  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const execCommand = (command, value = null) => {
    try {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      updateToolbarState();
      handleContentChange();
    } catch {
    }
  };

  const updateToolbarState = () => {
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
    } catch {
    }
  };

  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleClick = (e) => {
    
    const cell = e.target.closest('td, th');
    if (cell) {
      const table = cell.closest('table');
      setCurrentTable(table);
      setCurrentCell(cell);
      setShowTableToolbar(true);
    } else {
      setShowTableToolbar(false);
      setCurrentTable(null);
      setCurrentCell(null);
    }

    
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      e.preventDefault();
      e.stopPropagation();
      const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
      const href = link?.getAttribute('href');
      if (href) {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleFontSizeChange = (event) => {
    const size = event.target.value;
    setFontSize(size);
    execCommand('fontSize', '7');
    
    const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
    fontElements?.forEach(el => {
      el.removeAttribute('size');
      el.style.fontSize = `${size}px`;
    });
  };

  const handleColorChange = (type) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.onchange = (e) => {
      execCommand(type === 'text' ? 'foreColor' : 'backColor', e.target.value);
    };
    input.click();
  };

  const handleLink = () => {
    
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setLinkText(selection.toString());
      // Save the selection range for later use
      if (selection.rangeCount > 0) {
        window.savedRange = selection.getRangeAt(0);
      }
    } else {
      setLinkText('');
      // Save cursor position
      if (selection && selection.rangeCount > 0) {
        window.savedRange = selection.getRangeAt(0);
      }
    }
    setLinkUrl('');
    setLinkDialogOpen(true);
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      
      let validUrl = linkUrl.trim();
      
      
      if (!validUrl.match(/^https?:\/\//)) {
        validUrl = 'https://' + validUrl;
      }
      
      
      try {
        new URL(validUrl);
      } catch {
        alert(t('editor.invalidUrlError'));
        return;
      }
      
      
      editorRef.current?.focus();
      
      // Restore the saved selection/cursor position
      if (window.savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(window.savedRange);
      }
      
      
      const displayText = linkText.trim() || validUrl;
      const linkHTML = `<a href="${validUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>&nbsp;`;
      
      
      try {
        document.execCommand('insertHTML', false, linkHTML);
        handleContentChange();
      } catch {
      }
      
      // Clean up saved range
      window.savedRange = null;
      
      
      setLinkDialogOpen(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleInsertTable = () => {
    const rows = parseInt(tableRows) || 3;
    const cols = parseInt(tableCols) || 3;
    
    let tableHTML = '';
    
    
    if (tableCaption.trim()) {
      tableHTML += '<p style="font-weight: bold; margin: 20px 0 10px 0; font-style: italic;">' + tableCaption + '</p>';
    }
    
    tableHTML += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 0 0 20px 0; border: 1px solid #ddd;">';
    
    
    if (hasHeader) {
      tableHTML += '<thead><tr style="background-color: #f5f5f5; font-weight: bold;">';
      for (let c = 0; c < cols; c++) {
        tableHTML += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;"><br></th>';
      }
      tableHTML += '</tr></thead>';
    }
    
    
    tableHTML += '<tbody>';
    const bodyRows = hasHeader ? rows - 1 : rows;
    for (let r = 0; r < bodyRows; r++) {
      tableHTML += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;"><br></td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    
    try {
      document.execCommand('insertHTML', false, tableHTML);
      handleContentChange();
      setTableDialogOpen(false);
      setTableCaption(''); 
      editorRef.current?.focus();
    } catch {
    }
  };

  
  const addRowAbove = () => {
    if (!currentTable || !currentCell) return;
    
    const row = currentCell.parentElement;
    const newRow = row.cloneNode(true);
    
    newRow.querySelectorAll('td, th').forEach(cell => {
      cell.innerHTML = '<br>';
    });
    row.parentElement.insertBefore(newRow, row);
    handleContentChange();
  };

  const addRowBelow = () => {
    if (!currentTable || !currentCell) return;
    
    const row = currentCell.parentElement;
    const newRow = row.cloneNode(true);
    
    newRow.querySelectorAll('td, th').forEach(cell => {
      cell.innerHTML = '<br>';
    });
    row.parentElement.insertBefore(newRow, row.nextSibling);
    handleContentChange();
  };

  const deleteRow = () => {
    if (!currentTable || !currentCell) return;
    
    const row = currentCell.parentElement;
    const tbody = row.parentElement;
    
    
    if (tbody.querySelectorAll('tr').length <= 1) {
      setConfirmDialog({
        open: true,
        title: t('editor.table.cannotDeleteRow'),
        message: t('editor.table.cannotDeleteLastRow'),
        onConfirm: () => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })
      });
      return;
    }
    
    row.remove();
    handleContentChange();
    setShowTableToolbar(false);
  };

  const addColumnLeft = () => {
    if (!currentTable || !currentCell) return;
    
    const cellIndex = Array.from(currentCell.parentElement.children).indexOf(currentCell);
    const rows = currentTable.querySelectorAll('tr');
    
    rows.forEach(row => {
      const newCell = document.createElement(row.parentElement.tagName === 'THEAD' ? 'th' : 'td');
      newCell.style.border = '1px solid #ddd';
      newCell.style.padding = '8px';
      newCell.innerHTML = '<br>';
      row.insertBefore(newCell, row.children[cellIndex]);
    });
    
    handleContentChange();
  };

  const addColumnRight = () => {
    if (!currentTable || !currentCell) return;
    
    const cellIndex = Array.from(currentCell.parentElement.children).indexOf(currentCell);
    const rows = currentTable.querySelectorAll('tr');
    
    rows.forEach(row => {
      const newCell = document.createElement(row.parentElement.tagName === 'THEAD' ? 'th' : 'td');
      newCell.style.border = '1px solid #ddd';
      newCell.style.padding = '8px';
      newCell.innerHTML = '<br>';
      const refCell = row.children[cellIndex];
      row.insertBefore(newCell, refCell ? refCell.nextSibling : null);
    });
    
    handleContentChange();
  };

  const deleteColumn = () => {
    if (!currentTable || !currentCell) return;
    
    const cellIndex = Array.from(currentCell.parentElement.children).indexOf(currentCell);
    const rows = currentTable.querySelectorAll('tr');
    
    
    if (rows[0]?.children.length <= 1) {
      setConfirmDialog({
        open: true,
        title: t('editor.table.cannotDeleteColumn'),
        message: t('editor.table.cannotDeleteLastColumn'),
        onConfirm: () => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })
      });
      return;
    }
    
    rows.forEach(row => {
      if (row.children[cellIndex]) {
        row.children[cellIndex].remove();
      }
    });
    
    handleContentChange();
    setShowTableToolbar(false);
  };

  const deleteTable = () => {
    if (!currentTable) return;
    
    setConfirmDialog({
      open: true,
      title: t('editor.table.deleteTableTitle'),
      message: t('editor.table.deleteTableMessage'),
      onConfirm: () => {
        currentTable.remove();
        handleContentChange();
        setShowTableToolbar(false);
        setCurrentTable(null);
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}
            color="inherit"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={confirmDialog.onConfirm || (() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null }))}
            variant="contained"
            color={confirmDialog.title.includes('Delete') || confirmDialog.title.includes('löschen') ? 'error' : 'primary'}
            autoFocus
          >
            {t('common.ok')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('editor.link.insertLink')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label={t('editor.link.linkUrl')}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={t('editor.link.linkUrlPlaceholder')}
              fullWidth
              autoFocus
              helperText={t('editor.link.linkUrlHelper')}
            />
            <TextField
              label={t('editor.link.linkText')}
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder={t('editor.link.linkTextPlaceholder')}
              fullWidth
              helperText={t('editor.link.linkTextHelper')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleInsertLink} variant="contained" disabled={!linkUrl.trim()}>{t('editor.link.insertLink')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={tableDialogOpen} onClose={() => setTableDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('editor.table.insertTable')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label={t('editor.table.tableCaption')}
              value={tableCaption}
              onChange={(e) => setTableCaption(e.target.value)}
              placeholder={t('editor.table.tableCaptionPlaceholder')}
              fullWidth
              helperText={t('editor.table.tableCaptionHelper')}
            />
            <TextField
              label={t('editor.table.numberOfRows')}
              type="number"
              value={tableRows}
              onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 20 }}
              fullWidth
            />
            <TextField
              label={t('editor.table.numberOfColumns')}
              type="number"
              value={tableCols}
              onChange={(e) => setTableCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 10 }}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                />
              }
              label={t('editor.table.includeHeaderRow')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleInsertTable} variant="contained">{t('editor.table.insertTable')}</Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          p: 1,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Select
          value={fontSize}
          onChange={handleFontSizeChange}
          size="small"
          sx={{ minWidth: 80, height: 36 }}
        >
          {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
            <MenuItem key={size} value={size}>{size}px</MenuItem>
          ))}
        </Select>

        <Divider orientation="vertical" flexItem />

        <ButtonGroup size="small">
          <Tooltip title="Bold">
            <IconButton
              onClick={() => execCommand('bold')}
              sx={{ bgcolor: isBold ? 'primary.light' : 'transparent' }}
            >
              <FormatBold />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              onClick={() => execCommand('italic')}
              sx={{ bgcolor: isItalic ? 'primary.light' : 'transparent' }}
            >
              <FormatItalic />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton
              onClick={() => execCommand('underline')}
              sx={{ bgcolor: isUnderline ? 'primary.light' : 'transparent' }}
            >
              <FormatUnderlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton onClick={() => execCommand('strikethrough')}>
              <FormatStrikethrough />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        <ButtonGroup size="small">
          <Tooltip title="Text Color">
            <IconButton onClick={() => handleColorChange('text')}>
              <FormatColorText />
            </IconButton>
          </Tooltip>
          <Tooltip title="Background Color">
            <IconButton onClick={() => handleColorChange('background')}>
              <FormatColorFill />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        <ButtonGroup size="small">
          <Tooltip title="Align Left">
            <IconButton onClick={() => execCommand('justifyLeft')}>
              <FormatAlignLeft />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton onClick={() => execCommand('justifyCenter')}>
              <FormatAlignCenter />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton onClick={() => execCommand('justifyRight')}>
              <FormatAlignRight />
            </IconButton>
          </Tooltip>
          <Tooltip title="Justify">
            <IconButton onClick={() => execCommand('justifyFull')}>
              <FormatAlignJustify />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        <ButtonGroup size="small">
          <Tooltip title="Bullet List">
            <IconButton onClick={() => execCommand('insertUnorderedList')}>
              <FormatListBulleted />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton onClick={() => execCommand('insertOrderedList')}>
              <FormatListNumbered />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        <Tooltip title="Insert Link">
          <IconButton onClick={handleLink}>
            <LinkIcon />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        <Tooltip title="Insert Table">
          <IconButton onClick={() => setTableDialogOpen(true)}>
            <TableIcon />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        <ButtonGroup size="small">
          <Tooltip title="Undo">
            <IconButton onClick={() => execCommand('undo')}>
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton onClick={() => execCommand('redo')}>
              <Redo />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Box>

      {showTableToolbar && (
        <Box sx={{ 
          p: 1.5, 
          bgcolor: '#e3f2fd',
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mr: 1 }}>
            📊 {t('editor.table.tableToolsTitle')}
          </Typography>
          
          <ButtonGroup size="small" variant="contained">
            <Tooltip title={t('editor.table.addRowAbove')}>
              <Button onClick={addRowAbove} sx={{ minWidth: '90px' }}>
                ↑ {t('editor.table.rowButton')}
              </Button>
            </Tooltip>
            <Tooltip title={t('editor.table.addRowBelow')}>
              <Button onClick={addRowBelow} sx={{ minWidth: '90px' }}>
                ↓ {t('editor.table.rowButton')}
              </Button>
            </Tooltip>
            <Tooltip title={t('editor.table.deleteRow')}>
              <Button onClick={deleteRow} color="error" sx={{ minWidth: '90px' }}>
                ✕ {t('editor.table.rowButton')}
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'primary.light' }} />

          <ButtonGroup size="small" variant="contained">
            <Tooltip title={t('editor.table.addColumnLeft')}>
              <Button onClick={addColumnLeft} sx={{ minWidth: '90px' }}>
                ← {t('editor.table.colButton')}
              </Button>
            </Tooltip>
            <Tooltip title={t('editor.table.addColumnRight')}>
              <Button onClick={addColumnRight} sx={{ minWidth: '90px' }}>
                → {t('editor.table.colButton')}
              </Button>
            </Tooltip>
            <Tooltip title={t('editor.table.deleteColumn')}>
              <Button onClick={deleteColumn} color="error" sx={{ minWidth: '90px' }}>
                ✕ {t('editor.table.colButton')}
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'primary.light' }} />

          <Tooltip title={t('editor.table.deleteEntireTable')}>
            <Button 
              onClick={deleteTable} 
              variant="contained" 
              color="error" 
              size="small"
              startIcon={<DeleteIcon />}
              sx={{ minWidth: '120px' }}
            >
              {t('editor.table.deleteTable')}
            </Button>
          </Tooltip>
        </Box>
      )}

      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        onClick={handleClick}
        onMouseUp={updateToolbarState}
        onKeyUp={updateToolbarState}
        sx={{
          minHeight: 200,
          p: 2,
          outline: 'none',
          '&:focus': {
            bgcolor: 'background.paper',
          },
          '&:empty:before': {
            content: `"${editorPlaceholder}"`,
            color: 'text.disabled',
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'underline',
            cursor: 'pointer',
          },
          '& a:hover': {
            textDecoration: 'underline',
            opacity: 0.8,
          },
          
          '& table': {
            cursor: 'default',
            margin: '10px 0',
          },
          '& table:hover': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
          '& td, & th': {
            cursor: 'text',
          },
        }}
      />
      
      <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
        <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          💡 <strong>{t('editor.table.tableTips').split(':')[0]}:</strong> {t('editor.table.tableTips').split(':').slice(1).join(':')}
        </Box>
      </Box>
    </Box>
  );
};

export default RichTextEditor;
