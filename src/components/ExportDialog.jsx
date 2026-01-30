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
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import {
  GetApp as ExportIcon,
  PictureAsPdf as PdfIcon,
  Code as HtmlIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

const ExportDialog = ({ open, onClose, experiment, onExported }) => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const generateHTML = () => {
    if (!experiment) return '';

    const content = typeof experiment.content === 'string' 
      ? JSON.parse(experiment.content) 
      : experiment.content;
    
    
    const actualContent = content?.content || content;
    const config = actualContent?.config || {};
    const sections = actualContent?.sections || [];
    
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${experiment.title || t('export.experimentFallback')}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000000;
            background-color: #ffffff;
            max-width: 100%;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 24pt;
            color: #1976d2;
            margin-bottom: 15px;
            font-weight: bold;
        }
        
        .meta-info {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 12px;
        }
        
        .meta-badge {
            display: inline-block;
            padding: 6px 12px;
            background-color: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 9pt;
            color: #333;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
            clear: both;
        }
        
        .section-title {
            font-size: 16pt;
            color: #1976d2;
            border-bottom: 1px solid #cccccc;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-weight: bold;
        }
        
        .section-content {
            padding-left: 5px;
        }
        
        .subsection {
            margin-bottom: 15px;
        }
        
        .subsection-title {
            font-size: 13pt;
            color: #333333;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        ul, ol {
            margin-left: 25px;
            margin-bottom: 12px;
            padding-left: 10px;
        }
        
        li {
            margin-bottom: 6px;
            line-height: 1.4;
        }
        
        p {
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .materials-list {
            list-style-type: disc;
            margin-left: 20px;
            margin-bottom: 10px;
        }
        
        .materials-list li {
            margin-bottom: 5px;
        }
        
        .procedure-steps {
            list-style-type: decimal;
            margin-left: 20px;
            margin-bottom: 10px;
            counter-reset: step-counter;
        }
        
        .procedure-steps li {
            margin-bottom: 15px;
            padding-left: 5px;
        }
        
        .procedure-steps li strong {
            display: block;
            margin-bottom: 5px;
            color: #1976d2;
        }
        
        .step-notes {
            margin-top: 8px;
            padding: 8px 12px;
            background-color: #f5f5f5;
            border-left: 3px solid #1976d2;
            font-size: 10pt;
            line-height: 1.4;
        }
        
        .procedure-list {
            list-style-type: decimal;
        }
        
        .safety-warning {
            background-color: #fff9e6;
            border-left: 3px solid #ffa000;
            padding: 12px;
            margin: 12px 0;
            page-break-inside: avoid;
        }
        
        .safety-warning .title {
            font-weight: bold;
            color: #f57c00;
            margin-bottom: 8px;
            font-size: 11pt;
        }
        
        .objectives-box {
            background-color: #e3f2fd;
            border-left: 3px solid #1976d2;
            padding: 12px;
            margin: 12px 0;
            page-break-inside: avoid;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #cccccc;
            text-align: center;
            color: #666666;
            font-size: 9pt;
        }
        
        .media-gallery {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            margin: 20px 0;
            max-width: 100%;
        }
        
        .media-item {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            page-break-inside: avoid;
            background-color: #ffffff;
            text-align: center;
            width: 100%;
            max-width: 700px;
        }
        
        .media-item img,
        .media-item video {
            width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
            object-fit: contain;
            background-color: #fafafa;
        }
        
        .media-caption {
            padding: 12px;
            background-color: #f5f5f5;
            font-size: 10pt;
            color: #666;
            text-align: center;
            font-style: italic;
        }
            font-style: italic;
            text-align: center;
        }
        
        @media print {
            body {
                padding: 20px;
                background-color: white;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .media-gallery {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .media-item {
                page-break-inside: avoid;
                break-inside: avoid;
                display: block;
            }
            
            .media-item img {
                max-height: 300px;
                width: 100%;
                object-fit: contain;
                display: block;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            /* Hide videos in print/PDF as they don't work anyway */
            .media-item video {
                display: none;
            }
            
            /* Add a placeholder for videos */
            .media-item video + .media-caption::before {
                content: "🎥 Video: ";
                font-weight: bold;
            }
            
            /* Force color printing */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${experiment.title || t('export.experimentProtocol')}</h1>
        <div class="meta-info">
            ${config?.subject || experiment.course ? `<span class="meta-badge">${config?.subject || experiment.course}</span>` : ''}
            ${config?.gradeLevel || experiment.program ? `<span class="meta-badge">${config?.gradeLevel || experiment.program}</span>` : ''}
            ${config?.duration || experiment.estimated_duration ? `<span class="meta-badge">${t('export.duration')}: ${config?.duration || experiment.estimated_duration}</span>` : ''}
        </div>
    </div>
`;

    
    if (config?.description) {
      htmlContent += `
    <div class="section">
        <h2 class="section-title">📝 ${t('export.description')}</h2>
        <div class="section-content">
            <p>${config.description}</p>
        </div>
    </div>
`;
    }

    
    sections.forEach(section => {
      if (!section) return;
      
      const sectionContent = section.content;
      
      let sectionMedia = section.media || [];
      if ((!sectionMedia || sectionMedia.length === 0) && section.content && typeof section.content === 'object' && section.content.media) {
        sectionMedia = section.content.media;
      }
      const icon = getSectionIcon(section.id);
      
      
      const sectionTitle = section.name || section.title || 
        (section.id?.startsWith('custom_') ? t('export.customSection') : section.id || t('export.section'));
      
      htmlContent += `
    <div class="section">
        <h2 class="section-title">${icon} ${sectionTitle}</h2>
        <div class="section-content">
`;

      // Render media first (at the top) if present
      if (sectionMedia && sectionMedia.length > 0) {
        htmlContent += `
            <div class="media-gallery">
                ${sectionMedia.map(mediaItem => {
                      if (mediaItem.type && mediaItem.type.startsWith('image')) {
                        let imageSrc = mediaItem.data;
                        if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http')) {
                          imageSrc = new URL(imageSrc, window.location.origin).href;
                        }
                        return `
                        <div class="media-item">
                            <img src="${imageSrc}" alt="${mediaItem.caption || mediaItem.name || 'Image'}" />
                            ${mediaItem.caption ? `<div class="media-caption">${mediaItem.caption}</div>` : ''}
                        </div>
                        `;
                      } else if (mediaItem.type && mediaItem.type.startsWith('video')) {
                        return `
                        <div class="media-item">
                            <video controls poster="">
                                <source src="${mediaItem.data}" type="${mediaItem.type || 'video/mp4'}" />
                                Your browser does not support the video tag.
                            </video>
                            <div class="media-caption">
                                ${mediaItem.caption || mediaItem.name || 'Video'}
                                <br><small style="color: #999;">Note: Videos are not included in PDF exports</small>
                            </div>
                        </div>
                        `;
                      }
                      return '';
                    }).join('\n')}
                </div>
`;
      }

      
      if (Array.isArray(sectionContent)) {
        // Check if this is an array of procedure steps (objects with 'text' property)
        const isProcedureSteps = sectionContent.length > 0 && typeof sectionContent[0] === 'object' && sectionContent[0] !== null && 'text' in sectionContent[0];
        
        // Check if this is an array of materials (objects with 'name' property)
        const isMaterialsList = sectionContent.length > 0 && typeof sectionContent[0] === 'object' && sectionContent[0] !== null && 'name' in sectionContent[0];
        
        if (isProcedureSteps) {
          // Render procedure steps with numbering
          htmlContent += `
            <ol class="procedure-steps">
                ${sectionContent.map((step, index) => {
                  let stepHtml = `<li><strong>${step.text || ''}</strong>`;
                  if (step.notes) {
                    stepHtml += `<div class="step-notes">${step.notes}</div>`;
                  }
                  stepHtml += `</li>`;
                  return stepHtml;
                }).join('\n')}
            </ol>
`;
        } else if (isMaterialsList) {
          // Render materials list with name and quantity
          htmlContent += `
            <ul class="materials-list">
                ${sectionContent.map(item => {
                  let itemText = item.name || '';
                  if (item.quantity) {
                    itemText += ` (${item.quantity})`;
                  }
                  if (item.notes) {
                    itemText += ` - ${item.notes}`;
                  }
                  return `<li>${itemText}</li>`;
                }).join('\n')}
            </ul>
`;
        } else {
          // Filter for simple text items (strings/numbers)
          const textItems = sectionContent.filter(item => typeof item === 'string' || typeof item === 'number');
          if (textItems.length > 0) {
            htmlContent += `
            <ul class="materials-list">
                ${textItems.map(item => `<li>${item}</li>`).join('\n')}
            </ul>
`;
          }
        }
      } else if (typeof sectionContent === 'string') {
        if (sectionContent.startsWith('<')) {
          
          htmlContent += sectionContent;
        } else {
          
          htmlContent += `<p>${sectionContent.replace(/\n/g, '<br>')}</p>`;
        }
      } else if (typeof sectionContent === 'object' && sectionContent !== null) {
        
        Object.entries(sectionContent).forEach(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return;
          
          const keyLabel = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          
          if (Array.isArray(value)) {
            // Check if this is an array of procedure steps (objects with 'text' property)
            const isProcedureSteps = value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'text' in value[0];
            
            // Check if this is an array of materials (objects with 'name' property)
            const isMaterialsList = value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'name' in value[0];
            
            if (isProcedureSteps) {
              // Render procedure steps with numbering
              htmlContent += `
            <div class="subsection">
                <div class="subsection-title">${keyLabel}</div>
                <ol class="procedure-steps">
                    ${value.map((step, index) => {
                      let stepHtml = `<li><strong>${step.text || ''}</strong>`;
                      if (step.notes) {
                        stepHtml += `<div class="step-notes">${step.notes}</div>`;
                      }
                      stepHtml += `</li>`;
                      return stepHtml;
                    }).join('\n')}
                </ol>
            </div>
`;
            } else if (isMaterialsList) {
              // Render materials list with name and quantity
              htmlContent += `
            <div class="subsection">
                <div class="subsection-title">${keyLabel}</div>
                <ul class="materials-list">
                    ${value.map(item => {
                      let itemText = item.name || '';
                      if (item.quantity) {
                        itemText += ` (${item.quantity})`;
                      }
                      if (item.notes) {
                        itemText += ` - ${item.notes}`;
                      }
                      return `<li>${itemText}</li>`;
                    }).join('\n')}
                </ul>
            </div>
`;
            } else {
              // Filter for simple text items (strings/numbers)
              const textItems = value.filter(item => typeof item === 'string' || typeof item === 'number');
              if (textItems.length > 0) {
                htmlContent += `
            <div class="subsection">
                <div class="subsection-title">${keyLabel}</div>
                <ul class="materials-list">
                    ${textItems.map(item => `<li>${item}</li>`).join('\n')}
                </ul>
            </div>
`;
              }
            }
          } else {
            htmlContent += `
            <div class="subsection">
                <div class="subsection-title">${keyLabel}</div>
                <p>${value}</p>
            </div>
`;
          }
        });
      }
      
      htmlContent += `
        </div>
    </div>
`;
    });

    htmlContent += `
    <div class="footer">
        <p>${t('export.generatedFrom')}</p>
        <p>${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
`;

    return htmlContent;
  };

  const getSectionIcon = (sectionId) => {
    const icons = {
      objectives: '🎯',
      materials: '🧪',
      procedure: '📋',
      safety: '⚠️',
      introduction: '📖',
      theory: '📚',
      results: '📊',
      conclusion: '✅',
      references: '📚'
    };
    return icons[sectionId] || '📄';
  };

  const handleExportHTML = async () => {
    try {
      setExporting(true);
      setExportType('html');
      setExportSuccess(false);

      const html = generateHTML();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${experiment.title || 'experiment'}-v${experiment.version_number || 1}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      
      if (onExported) {
        onExported('html');
      }

      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      alert(t('export.unableToExportHTML') + ' ' + error.message);
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      setExportType('pdf');
      setExportSuccess(false);

      
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      
      
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px'; 
      container.style.padding = '40px';
      container.style.backgroundColor = '#ffffff';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '14px';
      container.style.color = '#000000';
      container.style.lineHeight = '1.6';
      
      
      const content = typeof experiment.content === 'string' 
        ? JSON.parse(experiment.content) 
        : experiment.content;
      
      const sections = content?.sections || [];
      
      
      container.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #1976d2; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1976d2; font-size: 28px; margin: 0 0 10px 0;">${experiment.title || t('export.experimentFallback')}</h1>
          <div style="color: #666; font-size: 12px;">
            <p style="margin: 5px 0;">${t('version.version')} ${experiment.version_number || 1}</p>
            <p style="margin: 5px 0;">${t('export.created')}: ${new Date(experiment.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      `;

      
      if (content?.config?.description) {
        container.innerHTML += `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1976d2; font-size: 20px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 15px;">📝 ${t('export.description')}</h2>
            <p style="margin: 0; line-height: 1.6;">${content.config.description}</p>
          </div>
        `;
      }

      
      sections.forEach(section => {
        if (!section) return;
        
        const sectionContent = section.content;
        const sectionMedia = section.media || []; 
        const icon = section.emoji || getSectionIcon(section.id);
        const sectionTitle = section.name || section.title || section.id || 'Section';
        
        container.innerHTML += `<div style="margin-bottom: 30px;">`;
        container.innerHTML += `<h2 style="color: #1976d2; font-size: 20px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 15px;">${icon} ${sectionTitle}</h2>`;

        if (sectionMedia && sectionMedia.length > 0) {
          container.innerHTML += `
            <div style="margin-bottom: 20px;">
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                ${sectionMedia.map(mediaItem => {
                  if (mediaItem.type === 'image') {
                    return `
                      <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: #f5f5f5;">
                        <img src="${mediaItem.data}" 
                             alt="${mediaItem.caption || mediaItem.name || 'Image'}" 
                             style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: contain;"
                             crossorigin="anonymous" />
                        ${mediaItem.caption ? `
                          <div style="padding: 8px; background-color: #f5f5f5; font-size: 11px; color: #666; font-style: italic; text-align: center;">
                            ${mediaItem.caption}
                          </div>
                        ` : ''}
                      </div>
                    `;
                  } else if (mediaItem.type === 'video') {
                    return `
                      <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: #000; position: relative; min-height: 150px; display: flex; align-items: center; justify-content: center;">
                        <div style="color: white; text-align: center; padding: 20px;">
                          <div style="font-size: 48px; margin-bottom: 10px;">🎥</div>
                          <div style="font-size: 12px;">${mediaItem.name || t('export.videoFile')}</div>
                          ${mediaItem.caption ? `<div style="font-size: 10px; margin-top: 5px; font-style: italic;">${mediaItem.caption}</div>` : ''}
                          <div style="font-size: 10px; margin-top: 10px; color: #999;">${t('export.videosCannotBeEmbedded')}</div>
                        </div>
                      </div>
                    `;
                  }
                  return '';
                }).join('')}
              </div>
            </div>
          `;
        }

        if (Array.isArray(sectionContent)) {
          
          container.innerHTML += `
            <ul style="margin: 0; padding-left: 20px;">
              ${sectionContent.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
            </ul>
          `;
        } else if (typeof sectionContent === 'string') {
          if (sectionContent.startsWith('<')) {
            
            container.innerHTML += sectionContent;
          } else {
            
            container.innerHTML += `<p style="margin: 0; line-height: 1.6;">${sectionContent.replace(/\n/g, '<br>')}</p>`;
          }
        } else if (typeof sectionContent === 'object' && sectionContent !== null) {
          
          Object.entries(sectionContent).forEach(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return;
            
            const keyLabel = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            
            if (Array.isArray(value)) {
              container.innerHTML += `
                <div style="margin-bottom: 15px;">
                  <div style="font-weight: bold; color: #555; margin-bottom: 5px;">${keyLabel}:</div>
                  <ul style="margin: 0; padding-left: 20px;">
                    ${value.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
                  </ul>
                </div>
              `;
            } else {
              container.innerHTML += `
                <div style="margin-bottom: 15px;">
                  <div style="font-weight: bold; color: #555; margin-bottom: 5px;">${keyLabel}:</div>
                  <p style="margin: 0; padding-left: 10px;">${value}</p>
                </div>
              `;
            }
          });
        }
        
        container.innerHTML += `</div>`;
      });

      
      container.innerHTML += `
        <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #ccc; text-align: center; color: #666; font-size: 11px;">
          <p style="margin: 5px 0;">${t('export.generatedFrom')}</p>
          <p style="margin: 5px 0;">${new Date().toLocaleString()}</p>
        </div>
      `;
      
      document.body.appendChild(container);

      
      const images = container.querySelectorAll('img');
      const imageLoadPromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => {
              resolve();
            };
            img.onerror = () => {
              resolve(); 
            };
          }
        });
      });

      await Promise.all(imageLoadPromises);

      
      await new Promise(resolve => setTimeout(resolve, 1000));

      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800,
        windowHeight: container.scrollHeight
      });

      
      document.body.removeChild(container);

      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; 

      
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20); 

      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      
      const filename = `${experiment.title || 'experiment'}-v${experiment.version_number || 1}.pdf`;
      pdf.save(filename);
      

      setExportSuccess(true);
      
      if (onExported) {
        onExported('pdf');
      }

      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);
    } catch {
      alert(t('export.exportFailed') + ': ' + error.message);
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  if (!experiment) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ExportIcon color="primary" />
          <Typography variant="h6">{t('export.exportExperiment')}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          <Alert severity="info">
            {t('export.exportInfo')}
          </Alert>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <strong>{experiment.title}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('version.version')} {experiment.version_number || 1}
            </Typography>
          </Paper>

          <Divider />

          <Stack spacing={2}>
            <Box>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={exporting && exportType === 'html' ? <CircularProgress size={20} /> : <HtmlIcon />}
                onClick={handleExportHTML}
                disabled={exporting}
                sx={{ 
                  py: 2,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderColor: 'primary.main',
                    '& .MuiTypography-root': {
                      color: 'white'
                    }
                  }
                }}
              >
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {exporting && exportType === 'html' ? t('export.generatingHTML') : t('export.exportHTML')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('export.htmlDescription')}
                  </Typography>
                </Box>
              </Button>
            </Box>

            <Box>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={exporting && exportType === 'pdf' ? <CircularProgress size={20} /> : <PdfIcon />}
                onClick={handleExportPDF}
                disabled={exporting}
                sx={{ 
                  py: 2,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  '&:hover': {
                    bgcolor: 'error.main',
                    color: 'white',
                    borderColor: 'error.main',
                    '& .MuiTypography-root': {
                      color: 'white'
                    }
                  }
                }}
              >
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {exporting && exportType === 'pdf' ? t('export.generatingPDF') : t('export.exportPDF')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('export.pdfDescription')}
                  </Typography>
                </Box>
              </Button>
            </Box>
          </Stack>

          {exportSuccess && (
            <Alert 
              severity="success" 
              icon={<SuccessIcon />}
              sx={{ animation: 'fadeIn 0.3s' }}
            >
              {t('export.exportSuccess')}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={exporting}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
