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

const RichTextEditor = ({ value = '', onChange, placeholder = 'Enter text...' }) => {
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
    } else {
      setLinkText('');
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
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
      
      
      editorRef.current?.focus();
      
      
      const displayText = linkText.trim() || validUrl;
      const linkHTML = `<a href="${validUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>&nbsp;`;
      
      
      try {
        document.execCommand('insertHTML', false, linkHTML);
        handleContentChange();
      } catch {
      }
      
      
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
        title: 'Cannot Delete Row',
        message: 'Cannot delete the last row in the table.',
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
        title: 'Cannot Delete Column',
        message: 'Cannot delete the last column in the table.',
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
      title: 'Delete Table?',
      message: 'Are you sure you want to delete this entire table? This action cannot be undone.',
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
            Cancel
          </Button>
          <Button 
            onClick={confirmDialog.onConfirm || (() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null }))}
            variant="contained"
            color={confirmDialog.title.includes('Delete') ? 'error' : 'primary'}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              fullWidth
              autoFocus
              helperText="Enter the web address to link to"
            />
            <TextField
              label="Link Text (optional)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Click here"
              fullWidth
              helperText="Leave empty to use selected text or URL as link text"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInsertLink} variant="contained" disabled={!linkUrl.trim()}>Insert Link</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={tableDialogOpen} onClose={() => setTableDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Insert Table</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Table Caption (optional)"
              value={tableCaption}
              onChange={(e) => setTableCaption(e.target.value)}
              placeholder="e.g., PCR-Protokoll, das am Thermocycler einzustellen ist"
              fullWidth
              helperText="Add a descriptive caption or heading for the table"
            />
            <TextField
              label="Number of Rows"
              type="number"
              value={tableRows}
              onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 20 }}
              fullWidth
            />
            <TextField
              label="Number of Columns"
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
              label="Include header row"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInsertTable} variant="contained">Insert Table</Button>
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
            📊 Table Tools
          </Typography>
          
          <ButtonGroup size="small" variant="contained">
            <Tooltip title="Add Row Above">
              <Button onClick={addRowAbove} sx={{ minWidth: '90px' }}>
                ↑ Row
              </Button>
            </Tooltip>
            <Tooltip title="Add Row Below">
              <Button onClick={addRowBelow} sx={{ minWidth: '90px' }}>
                ↓ Row
              </Button>
            </Tooltip>
            <Tooltip title="Delete Row">
              <Button onClick={deleteRow} color="error" sx={{ minWidth: '90px' }}>
                ✕ Row
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'primary.light' }} />

          <ButtonGroup size="small" variant="contained">
            <Tooltip title="Add Column Left">
              <Button onClick={addColumnLeft} sx={{ minWidth: '90px' }}>
                ← Col
              </Button>
            </Tooltip>
            <Tooltip title="Add Column Right">
              <Button onClick={addColumnRight} sx={{ minWidth: '90px' }}>
                → Col
              </Button>
            </Tooltip>
            <Tooltip title="Delete Column">
              <Button onClick={deleteColumn} color="error" sx={{ minWidth: '90px' }}>
                ✕ Col
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'primary.light' }} />

          <Tooltip title="Delete Entire Table">
            <Button 
              onClick={deleteTable} 
              variant="contained" 
              color="error" 
              size="small"
              startIcon={<DeleteIcon />}
              sx={{ minWidth: '120px' }}
            >
              Delete Table
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
            content: `"${placeholder}"`,
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
          💡 <strong>Table tips:</strong> Triple-click a table to select it, then press Delete/Backspace to remove. 
          To modify: click in a cell, use your browser's right-click menu for row/column operations.
        </Box>
      </Box>
    </Box>
  );
};

export default RichTextEditor;
