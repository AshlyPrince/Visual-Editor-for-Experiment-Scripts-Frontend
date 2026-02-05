import { useState, useEffect } from 'react';
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

const ExportDialog = ({ open, onClose, experiment, onExported, autoExportFormat }) => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    if (open && autoExportFormat && !exporting) {
      if (autoExportFormat === 'html') {
        handleExportHTML();
      } else if (autoExportFormat === 'pdf') {
        handleExportPDF();
      }
    }
  }, [open, autoExportFormat]);

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
            margin: 0;
            padding: 0;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 60px;
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
            break-inside: avoid;
            clear: both;
        }
        
        .section-title {
            font-size: 16pt;
            color: #1976d2;
            border-bottom: 1px solid #cccccc;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-weight: bold;
            page-break-after: avoid;
            break-after: avoid;
        }
        
        .section-content {
            padding-left: 5px;
            overflow-wrap: break-word;
            word-wrap: break-word;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .subsection {
            margin-bottom: 15px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .subsection p {
            margin-bottom: 10px;
        }
        
        .subsection-title {
            font-size: 13pt;
            color: #333333;
            margin-bottom: 8px;
            font-weight: bold;
            page-break-after: avoid;
            break-after: avoid;
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
            margin-bottom: 12px;
            line-height: 1.6;
            text-align: justify;
            white-space: pre-wrap;
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
            padding-right: 35px;
            page-break-inside: avoid;
            break-inside: avoid;
            position: relative;
        }
        
        .procedure-steps li strong {
            display: block;
            margin-bottom: 5px;
            color: #333;
        }
        
        .step-checkbox {
            position: absolute;
            right: 0;
            top: 0;
            width: 20px;
            height: 20px;
            border: 2px solid #666;
            border-radius: 3px;
            background-color: white;
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
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #cccccc;
            text-align: center;
            color: #666666;
            font-size: 9pt;
            page-break-inside: avoid;
            clear: both;
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
        
        .safety-icons-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin: 20px 0;
            max-width: 600px;
        }
        
        .safety-icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            page-break-inside: avoid;
            width: 60px;
        }
        
        .safety-icon-item img {
            width: 40px;
            height: 40px;
            object-fit: contain;
            display: block;
        }
        
        .safety-icon-caption {
            margin-top: 8px;
            font-size: 8pt;
            color: #666;
            text-align: center;
            max-width: 60px;
            word-wrap: break-word;
            line-height: 1.2;
        }
        
        .media-caption {
            padding: 12px;
            background-color: #f5f5f5;
            font-size: 10pt;
            color: #666;
            text-align: center;
            font-style: italic;
        }
        
        @media screen and (max-width: 768px) {
            .container {
                padding: 30px 30px;
            }
        }
        
        @media screen and (max-width: 480px) {
            .container {
                padding: 20px 20px;
            }
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
                background-color: white;
                orphans: 3;
                widows: 3;
            }
            
            .container {
                padding: 30px 40px;
                height: auto !important;
                overflow: visible !important;
                orphans: 3;
                widows: 3;
            }
            
            .section {
                page-break-inside: auto;
                break-inside: auto;
                page-break-before: auto;
                margin-bottom: 25px;
                position: static !important;
                orphans: 3;
                widows: 3;
                height: auto !important;
                overflow: visible !important;
            }
            
            .section-title {
                page-break-after: avoid;
                break-after: avoid;
            }
            
            .section-content {
                orphans: 3;
                widows: 3;
            }
            
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
                break-after: avoid;
                orphans: 3;
                widows: 3;
            }
            
            p, li {
                orphans: 3;
                widows: 3;
            }
            
            .media-gallery {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .media-item {
                page-break-inside: avoid;
                break-inside: avoid;
                display: block;
            }
            
            .media-item img {
                max-height: 500px;
                max-width: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
                display: block;
                page-break-inside: avoid;
                break-inside: avoid;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .safety-icons-gallery {
                page-break-inside: avoid;
                break-inside: avoid;
                orphans: 3;
                widows: 3;
            }
            
            .safety-icon-item {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            table {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .subsection,
            .objectives-box,
            .safety-warning {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .procedure-steps li {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .media-item video {
                display: none;
            }
            
            .media-item video + .media-caption::before {
                content: "🎥 Video: ";
                font-weight: bold;
            }
            
            .footer {
                page-break-before: auto;
                margin-top: 30px;
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
    <div class="header">
        <h1>${experiment.title || t('export.experimentProtocol')}</h1>
        <div class="meta-info">
            ${config?.subjectArea || config?.subject || experiment.course ? `<span class="meta-badge">${t('experiment.course')}: ${config?.subjectArea || config?.subject || experiment.course}</span>` : ''}
            ${config?.difficultyLevel || config?.gradeLevel || experiment.program ? `<span class="meta-badge">${t('experiment.program')}: ${config?.difficultyLevel || config?.gradeLevel || experiment.program}</span>` : ''}
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
      
      let sectionContent = section.content;
      
      if (typeof sectionContent === 'string') {
        try {
          const parsed = JSON.parse(sectionContent);
          sectionContent = parsed;
        } catch (e) {
        }
      }
      
      if (sectionContent && typeof sectionContent === 'object' && !Array.isArray(sectionContent)) {
        if (sectionContent.steps && Array.isArray(sectionContent.steps)) {
          sectionContent = sectionContent.steps;
        } else if (sectionContent.items && Array.isArray(sectionContent.items)) {
          sectionContent = sectionContent.items;
        }
      }
      
      if (sectionContent && typeof sectionContent === 'object' && !Array.isArray(sectionContent)) {
        if (sectionContent.content) {
          sectionContent = sectionContent.content;
          
          if (sectionContent && typeof sectionContent === 'object' && !Array.isArray(sectionContent)) {
            if (sectionContent.steps && Array.isArray(sectionContent.steps)) {
              sectionContent = sectionContent.steps;
            } else if (sectionContent.items && Array.isArray(sectionContent.items)) {
              sectionContent = sectionContent.items;
            }
          }
        }
      }
      
      let sectionMedia = section.media || [];
      if ((!sectionMedia || sectionMedia.length === 0) && section.content && typeof section.content === 'object' && section.content.media) {
        sectionMedia = section.content.media;
      }
      
      const hasContent = () => {
        if (sectionMedia && sectionMedia.length > 0) return true;
        
        if (typeof sectionContent === 'string' && sectionContent.trim()) {
          return true;
        }
        
        if (Array.isArray(sectionContent) && sectionContent.length > 0) {
          return true;
        }
        
        if (typeof sectionContent === 'object' && sectionContent !== null) {
          const hasNonEmptyFields = Object.entries(sectionContent).some(([key, value]) => {
            if (key === 'media') return false;
            if (Array.isArray(value) && value.length > 0) return true;
            if (typeof value === 'string' && value.trim()) return true;
            if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) return true;
            return false;
          });
          return hasNonEmptyFields;
        }
        
        return false;
      };
      
      if (!hasContent()) {
        return;
      }
      
      const icon = getSectionIcon(section.id);

      const sectionTitle = section.name || section.title || 
        (section.id?.startsWith('custom_') ? t('export.customSection') : section.id || t('export.section'));
      
      htmlContent += `
    <div class="section">
        <h2 class="section-title">${icon} ${sectionTitle}</h2>
        <div class="section-content">
`;

      if (sectionMedia && sectionMedia.length > 0) {
        const isSafetySection = section.id === 'safety' || 
                                (section.name && section.name.toLowerCase().includes('safety'));
        const isHazardsSection = section.id === 'hazards' || 
                                 (section.name && section.name.toLowerCase().includes('hazard'));

        const iconMedia = sectionMedia.filter(m => {
          const name = (m.name || '').toLowerCase();
          const url = (m.url || m.data || '').toLowerCase();
          const caption = (m.caption || '').toLowerCase();
          
          if (isSafetySection) {
            return m.isSafetyIcon || 
                   name.includes('safety-') || 
                   name.includes('saftey-') ||
                   name.includes('ppe') ||
                   name.includes('goggles') ||
                   name.includes('gloves') ||
                   name.includes('helmet') ||
                   name.includes('faceshield') ||
                   name.includes('headset') ||
                   name.includes('lab coat') ||
                   name.includes('labcoat') ||
                   name.includes('coat') ||
                   name.includes('mask') ||
                   name.includes('respirator') ||
                   name.includes('apron') ||
                   name.includes('boots') ||
                   name.includes('shoe') ||
                   name.includes('wear') ||
                   
                   name.includes('schutzbrille') ||
                   name.includes('handschuhe') ||
                   name.includes('helm') ||
                   name.includes('kittel') ||
                   name.includes('laborkittel') ||
                   name.includes('schutzkleidung') ||
                   name.includes('atemschutz') ||
                   name.includes('schürze') ||
                   name.includes('stiefel') ||
                   caption.includes('schutzbrille') ||
                   caption.includes('handschuhe') ||
                   caption.includes('helm') ||
                   caption.includes('kittel') ||
                   caption.includes('schutz') ||
                   url.includes('/saftey/') ||
                   url.includes('/safety/');
                   url.includes('/safety/');
          } else if (isHazardsSection) {
            return m.isHazardIcon || 
                   name.includes('ghs') || 
                   name.includes('hazard') ||
                   name.includes('toxic') ||
                   name.includes('flammable') ||
                   name.includes('corrosive') ||
                   name.includes('explosive') ||
                   name.includes('oxidizing') ||
                   name.includes('irritant') ||
                   name.includes('compressed') ||
                   name.includes('environmental') ||
                   
                   name.includes('giftig') ||
                   name.includes('ätzend') ||
                   name.includes('entzündbar') ||
                   name.includes('explosiv') ||
                   name.includes('oxidierend') ||
                   name.includes('reizend') ||
                   name.includes('umwelt') ||
                   name.includes('gesundheit') ||
                   caption.includes('giftig') ||
                   caption.includes('ätzend') ||
                   caption.includes('entzündbar') ||
                   caption.includes('explosiv') ||
                   caption.includes('gefahr') ||
                   url.includes('/ghs/') ||
                   url.includes('/hazard/');
          }
          return false;
        });
        
        const regularMedia = sectionMedia.filter(m => {
          const name = (m.name || '').toLowerCase();
          const url = (m.url || m.data || '').toLowerCase();
          const caption = (m.caption || '').toLowerCase();
          
          if (isSafetySection) {
            return !m.isSafetyIcon && 
                   !name.includes('safety-') && 
                   !name.includes('saftey-') &&
                   !name.includes('ppe') &&
                   !name.includes('goggles') &&
                   !name.includes('gloves') &&
                   !name.includes('helmet') &&
                   !name.includes('faceshield') &&
                   !name.includes('headset') &&
                   !name.includes('lab coat') &&
                   !name.includes('labcoat') &&
                   !name.includes('coat') &&
                   !name.includes('mask') &&
                   !name.includes('respirator') &&
                   !name.includes('apron') &&
                   !name.includes('boots') &&
                   !name.includes('shoe') &&
                   !name.includes('wear') &&
                   
                   !name.includes('schutzbrille') &&
                   !name.includes('handschuhe') &&
                   !name.includes('helm') &&
                   !name.includes('kittel') &&
                   !name.includes('laborkittel') &&
                   !name.includes('schutzkleidung') &&
                   !name.includes('atemschutz') &&
                   !name.includes('schürze') &&
                   !name.includes('stiefel') &&
                   !caption.includes('schutzbrille') &&
                   !caption.includes('handschuhe') &&
                   !caption.includes('helm') &&
                   !caption.includes('kittel') &&
                   !caption.includes('schutz') &&
                   !url.includes('/saftey/') &&
                   !url.includes('/safety/');
          } else if (isHazardsSection) {
            return !m.isHazardIcon && 
                   !name.includes('ghs') && 
                   !name.includes('hazard') &&
                   !name.includes('toxic') &&
                   !name.includes('flammable') &&
                   !name.includes('corrosive') &&
                   !name.includes('explosive') &&
                   !name.includes('oxidizing') &&
                   !name.includes('irritant') &&
                   !name.includes('compressed') &&
                   !name.includes('environmental') &&
                   
                   !name.includes('giftig') &&
                   !name.includes('ätzend') &&
                   !name.includes('entzündbar') &&
                   !name.includes('explosiv') &&
                   !name.includes('oxidierend') &&
                   !name.includes('reizend') &&
                   !name.includes('umwelt') &&
                   !name.includes('gesundheit') &&
                   !caption.includes('giftig') &&
                   !caption.includes('ätzend') &&
                   !caption.includes('entzündbar') &&
                   !caption.includes('explosiv') &&
                   !caption.includes('gefahr') &&
                   !url.includes('/ghs/') &&
                   !url.includes('/hazard/');
          }
          return true;
        });

        if (iconMedia.length > 0) {
          htmlContent += `
            <div class="safety-icons-gallery">
                ${iconMedia.map(mediaItem => {
                      if (mediaItem.type && mediaItem.type.startsWith('image')) {
                        let imageSrc = mediaItem.data;
                        if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http')) {
                          imageSrc = new URL(imageSrc, window.location.origin).href;
                        }
                        return `
                        <div class="safety-icon-item">
                            <img src="${imageSrc}" alt="${mediaItem.caption || mediaItem.name || 'Safety Icon'}" />
                            ${mediaItem.caption || mediaItem.name ? `<div class="safety-icon-caption">${mediaItem.caption || mediaItem.name}</div>` : ''}
                        </div>
                        `;
                      }
                      return '';
                    }).join('\n')}
                </div>
`;
        }

        if (regularMedia.length > 0) {
          htmlContent += `
            <div class="media-gallery">
                ${regularMedia.map(mediaItem => {
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
      }

      if (Array.isArray(sectionContent)) {
        const isProcedureSteps = sectionContent.length > 0 && typeof sectionContent[0] === 'object' && sectionContent[0] !== null && ('text' in sectionContent[0] || 'instruction' in sectionContent[0]);
        
        const isMaterialsList = sectionContent.length > 0 && typeof sectionContent[0] === 'object' && sectionContent[0] !== null;
        
        if (isProcedureSteps) {
          htmlContent += `
            <ol class="procedure-steps">
                ${sectionContent.map((step, index) => {
                  const stepText = step.instruction || step.text || '';
                  let stepHtml = `<li><strong>${stepText}</strong>`;
                  if (step.notes) {
                    stepHtml += `<div class="step-notes">${step.notes}</div>`;
                  }
                  
                  if (step.media && Array.isArray(step.media) && step.media.length > 0) {
                    stepHtml += `<div class="media-gallery">`;
                    step.media.forEach(mediaItem => {
                      if (mediaItem.type && mediaItem.type.startsWith('image')) {
                        let imageSrc = mediaItem.data;
                        if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http')) {
                          imageSrc = new URL(imageSrc, window.location.origin).href;
                        }
                        stepHtml += `
                          <div class="media-item">
                            <img src="${imageSrc}" alt="${mediaItem.caption || mediaItem.name || 'Image'}" />
                            ${mediaItem.caption ? `<div class="media-caption">${mediaItem.caption}</div>` : ''}
                          </div>
                        `;
                      } else if (mediaItem.type && mediaItem.type.startsWith('video')) {
                        stepHtml += `
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
                    });
                    stepHtml += `</div>`;
                  }
                  
                  stepHtml += `<div class="step-checkbox"></div></li>`;
                  return stepHtml;
                }).join('\n')}
            </ol>
`;
        } else if (isMaterialsList) {
          htmlContent += `
            <ul class="materials-list">
                ${sectionContent.map((item, idx) => {
                  if (typeof item === 'string' || typeof item === 'number') {
                    const text = String(item).trim();
                    return text ? `<li>${text}</li>` : '';
                  } else if (typeof item === 'object' && item !== null) {
                    if (item.item && Array.isArray(item.item)) {
                      return item.item.map((nestedItem, nestedIdx) => {
                        if (typeof nestedItem === 'string' || typeof nestedItem === 'number') {
                          const text = String(nestedItem).trim();
                          return text ? `<li>${text}</li>` : '';
                        } else if (typeof nestedItem === 'object' && nestedItem !== null) {
                          const text = (nestedItem.name || nestedItem.text || nestedItem.title || nestedItem.item || '').trim();
                          return text ? `<li>${text}</li>` : '';
                        }
                        return '';
                      }).filter(html => html).join('\n');
                    }
                    
                    let itemText = '';
                    
                    if (item.item && typeof item.item === 'string') {
                      itemText = item.item.trim();
                    } else if (item.name && typeof item.name === 'string') {
                      itemText = item.name.trim();
                    } else if (item.text && typeof item.text === 'string') {
                      itemText = item.text.trim();
                    } else if (item.title && typeof item.title === 'string') {
                      itemText = item.title.trim();
                    }
                    
                    if (item.quantity) {
                      itemText += ` (${item.quantity})`;
                    }
                    
                    if (item.notes) {
                      itemText += ` - ${item.notes}`;
                    }
                    
                    if (!itemText) {
                      const keys = Object.keys(item);
                      if (keys.length > 0) {
                        itemText = Object.values(item).filter(v => typeof v === 'string' || typeof v === 'number').map(v => String(v).trim()).filter(v => v).join(' ');
                      }
                    }
                    
                    let result = itemText ? `<li>${itemText}` : '';
                    
                    if (item.media && item.media.data) {
                      let imageSrc = item.media.data;
                      if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http')) {
                        imageSrc = new URL(imageSrc, window.location.origin).href;
                      }
                      result += `
                        <div class="media-item" style="margin-top: 8px;">
                          <img src="${imageSrc}" alt="${item.media.name || item.media.caption || 'Material photo'}" style="max-width: 300px; border-radius: 4px; border: 1px solid #ddd;" />
                          ${item.media.caption ? `<div class="media-caption">${item.media.caption}</div>` : ''}
                        </div>`;
                    }
                    
                    result += itemText ? `</li>` : '';
                    return result;
                  }
                  return '';
                }).filter(html => html).join('\n')}
            </ul>
`;
        } else {
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
          const paragraphs = sectionContent.split(/\n\n+/);
          paragraphs.forEach(para => {
            const cleanedPara = para.trim().replace(/\n/g, ' ');
            if (cleanedPara) {
              htmlContent += `<p>${cleanedPara}</p>`;
            }
          });
        }
      } else if (typeof sectionContent === 'object' && sectionContent !== null) {
        
        Object.entries(sectionContent).forEach(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return;
          
          const keyLabel = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          
          if (Array.isArray(value)) {
            const isProcedureSteps = value.length > 0 && typeof value[0] === 'object' && value[0] !== null && ('text' in value[0] || 'instruction' in value[0]);
            
            const isObjectList = value.length > 0 && typeof value[0] === 'object' && value[0] !== null;
            
            if (isProcedureSteps) {
              htmlContent += `
            <div class="subsection">
                <div class="subsection-title">${keyLabel}</div>
                <ol class="procedure-steps">
                    ${value.map((step, index) => {
                      const stepText = step.instruction || step.text || '';
                      let stepHtml = `<li><strong>${stepText}</strong>`;
                      if (step.notes) {
                        stepHtml += `<div class="step-notes">${step.notes}</div>`;
                      }
                      
                      if (step.media && Array.isArray(step.media) && step.media.length > 0) {
                        stepHtml += `<div class="media-gallery">`;
                        step.media.forEach(mediaItem => {
                          if (mediaItem.type && mediaItem.type.startsWith('image')) {
                            let imageSrc = mediaItem.data;
                            if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http')) {
                              imageSrc = new URL(imageSrc, window.location.origin).href;
                            }
                            stepHtml += `
                              <div class="media-item">
                                <img src="${imageSrc}" alt="${mediaItem.caption || mediaItem.name || 'Image'}" />
                                ${mediaItem.caption ? `<div class="media-caption">${mediaItem.caption}</div>` : ''}
                              </div>
                            `;
                          } else if (mediaItem.type && mediaItem.type.startsWith('video')) {
                            stepHtml += `
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
                        });
                        stepHtml += `</div>`;
                      }
                      
                      stepHtml += `<div class="step-checkbox"></div></li>`;
                      return stepHtml;
                    }).join('\n')}
                </ol>
            </div>
`;
            } else if (isObjectList) {
              htmlContent += `
            <div class="subsection">
                <div class="subsection-title">${keyLabel}</div>
                <ul class="materials-list">
                    ${value.map((item, idx) => {
                      if (typeof item === 'string' || typeof item === 'number') {
                        const text = String(item).trim();
                        return text ? `<li>${text}</li>` : '';
                      } else if (typeof item === 'object' && item !== null) {
                        let itemText = (item.name || item.text || item.title || item.item || '').trim();
                        
                        if (item.quantity) {
                          itemText += ` (${item.quantity})`;
                        }
                        
                        if (item.notes) {
                          itemText += ` - ${item.notes}`;
                        }
                        
                        if (!itemText) {
                          const keys = Object.keys(item);
                          if (keys.length > 0) {
                            itemText = Object.values(item).filter(v => typeof v === 'string' || typeof v === 'number').map(v => String(v).trim()).filter(v => v).join(' ');
                          }
                        }
                        
                        const result = itemText ? `<li>${itemText}</li>` : '';
                        return result;
                      }
                      return '';
                    }).filter(html => html).join('\n')}
                </ul>
            </div>
`;
            } else {
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
          } else if (typeof value === 'string') {
          } else if (typeof value === 'string') {
            const paragraphs = value.split(/\n\n+/);
            htmlContent += `
            <div class="subsection">
                <div class="subsection-title">${keyLabel}</div>
`;
            paragraphs.forEach(para => {
              const cleanedPara = para.trim().replace(/\n/g, ' ');
              if (cleanedPara) {
                htmlContent += `                <p>${cleanedPara}</p>\n`;
              }
            });
            htmlContent += `
            </div>
`;        } else if (typeof value === 'object' && value !== null) {
            console.warn(`[Export] Skipping unhandled object value for key "${key}":`, value);
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

      if (autoExportFormat) {
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setTimeout(() => {
          setExportSuccess(false);
        }, 2000);
      }
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
      
      const htmlContent = generateHTML();

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm'; 
      container.style.backgroundColor = '#ffffff';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.color = '#000000';
      container.style.lineHeight = '1.6';
      container.style.boxSizing = 'border-box';
      
      container.innerHTML = htmlContent;
      
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

      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
        width: container.scrollWidth,
        height: container.scrollHeight
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
      const margin = 15;
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = pdfHeight - (2 * margin);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const totalPages = Math.ceil(imgHeight / contentHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const yOffset = page * contentHeight;

        const remainingHeight = imgHeight - yOffset;
        const pageContentHeight = Math.min(contentHeight, remainingHeight);

        pdf.addImage(
          imgData, 
          'JPEG', 
          margin, 
          margin - yOffset,  
          imgWidth, 
          imgHeight,
          undefined,
          'FAST'
        );

        if (page < totalPages - 1) {
          
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, margin + pageContentHeight, pdfWidth, pdfHeight - margin - pageContentHeight, 'F');
        }
      }
      
      const filename = `${experiment.title || 'experiment'}-v${experiment.version_number || 1}.pdf`;
      pdf.save(filename);

      setExportSuccess(true);
      
      if (onExported) {
        onExported('pdf');
      }

      if (autoExportFormat) {
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setTimeout(() => {
          setExportSuccess(false);
        }, 2000);
      }
    } catch (error) {
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
