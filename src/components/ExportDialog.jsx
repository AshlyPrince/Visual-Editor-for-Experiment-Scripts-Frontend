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
    console.log('=== [EXPORT] generateHTML CALLED ===');
    if (!experiment) return '';

    console.log('[EXPORT] Experiment data:', experiment);

    const content = typeof experiment.content === 'string' 
      ? JSON.parse(experiment.content) 
      : experiment.content;
    
    console.log('[EXPORT] Parsed content:', content);
    
    const actualContent = content?.content || content;
    const config = actualContent?.config || {};
    const sections = actualContent?.sections || [];
    
    console.log('[EXPORT] Sections to process:', sections.length);
    
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
            color: #1976d2;
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
            width: 80px;
        }
        
        .safety-icon-item img {
            width: 60px;
            height: 60px;
            object-fit: contain;
            display: block;
        }
        
        .safety-icon-caption {
            margin-top: 8px;
            font-size: 8pt;
            color: #666;
            text-align: center;
            max-width: 80px;
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
            }
            
            .container {
                padding: 30px 40px;
            }
            
            .section {
                page-break-inside: avoid;
                break-inside: avoid;
                page-break-before: auto;
                margin-bottom: 25px;
            }
            
            .section-title {
                page-break-after: avoid;
                break-after: avoid;
            }
            
            .section-content {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .footer {
                page-break-before: auto;
                margin-top: 30px;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
                break-after: avoid;
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
            
            .media-item video {
                display: none;
            }
            
            .media-item video + .media-caption::before {
                content: "🎥 Video: ";
                font-weight: bold;
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
      
      console.log(`[Export] Processing section: ${section.id}`, section);
      
      let sectionContent = section.content;
      
      if (typeof sectionContent === 'string') {
        try {
          const parsed = JSON.parse(sectionContent);
          console.log(`[Export] Parsed JSON string content for ${section.id}:`, parsed);
          sectionContent = parsed;
        } catch (e) {
          console.log(`[Export] Content for ${section.id} is string (not JSON):`, sectionContent.substring(0, 100));
        }
      }
      
      console.log(`[Export] Initial section content for ${section.id}:`, sectionContent);
      console.log(`[Export] Content type:`, typeof sectionContent, 'Is array:', Array.isArray(sectionContent));
      
      if (sectionContent && typeof sectionContent === 'object' && !Array.isArray(sectionContent)) {
        if (sectionContent.steps && Array.isArray(sectionContent.steps)) {
          console.log(`[Export] Extracting steps array for ${section.id}:`, sectionContent.steps);
          sectionContent = sectionContent.steps;
        } else if (sectionContent.items && Array.isArray(sectionContent.items)) {
          console.log(`[Export] Extracting items array for ${section.id}:`, sectionContent.items);
          sectionContent = sectionContent.items;
        }
      }
      
      console.log(`[Export] Final section content for ${section.id}:`, sectionContent);
      
      if (sectionContent && typeof sectionContent === 'object' && !Array.isArray(sectionContent)) {
        if (sectionContent.content) {
          console.log(`[Export] Found nested content.content for ${section.id}:`, sectionContent.content);
          sectionContent = sectionContent.content;
          
          if (sectionContent && typeof sectionContent === 'object' && !Array.isArray(sectionContent)) {
            if (sectionContent.steps && Array.isArray(sectionContent.steps)) {
              console.log(`[Export] Extracting nested steps for ${section.id}:`, sectionContent.steps);
              sectionContent = sectionContent.steps;
            } else if (sectionContent.items && Array.isArray(sectionContent.items)) {
              console.log(`[Export] Extracting nested items for ${section.id}:`, sectionContent.items);
              sectionContent = sectionContent.items;
            }
          }
        }
      }
      
      console.log(`[Export] After unwrapping, section content for ${section.id}:`, sectionContent);
      
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
        console.log(`[Export] Section "${section.name || section.id}" has no content, skipping`);
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
        const isSafetySection = section.id === 'safety' || section.id === 'hazards';
        
        if (isSafetySection) {
          htmlContent += `
            <div class="safety-icons-gallery">
                ${sectionMedia.map(mediaItem => {
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
        } else {
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
      }

      
      if (Array.isArray(sectionContent)) {
        console.log(`[Export] Section content is array for ${section.id}, length:`, sectionContent.length);
        if (sectionContent.length > 0) {
          console.log(`[Export] First item in array:`, sectionContent[0]);
        }
        
        const isProcedureSteps = sectionContent.length > 0 && typeof sectionContent[0] === 'object' && sectionContent[0] !== null && ('text' in sectionContent[0] || 'instruction' in sectionContent[0]);
        
        const isMaterialsList = sectionContent.length > 0 && typeof sectionContent[0] === 'object' && sectionContent[0] !== null;
        
        console.log(`[Export] isProcedureSteps:`, isProcedureSteps, 'isMaterialsList:', isMaterialsList);
        
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
          console.log(`[Export] Rendering materials list for ${section.id}, items:`, sectionContent);
          htmlContent += `
            <ul class="materials-list">
                ${sectionContent.map((item, idx) => {
                  console.log(`[Export] Processing item ${idx}:`, item, 'Type:', typeof item);
                  
                  if (typeof item === 'string' || typeof item === 'number') {
                    console.log(`[Export] Item ${idx} is string/number:`, item);
                    const text = String(item).trim();
                    return text ? `<li>${text}</li>` : '';
                  } else if (typeof item === 'object' && item !== null) {
                    console.log(`[Export] Item ${idx} is object, keys:`, Object.keys(item));
                    console.log(`[Export] Item ${idx} values:`, Object.values(item));
                    
                    if (item.item && Array.isArray(item.item)) {
                      console.log(`[Export] Item ${idx} has nested array in .item property:`, item.item);
                      return item.item.map((nestedItem, nestedIdx) => {
                        console.log(`[Export] Processing nested item ${nestedIdx}:`, nestedItem);
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
                    
                    console.log(`[Export] Extracted itemText for ${idx}:`, itemText);
                    
                    if (item.quantity) {
                      itemText += ` (${item.quantity})`;
                    }
                    
                    if (item.notes) {
                      itemText += ` - ${item.notes}`;
                    }
                    
                    if (!itemText) {
                      console.log(`[Export] No itemText found, trying to extract from values`);
                      const keys = Object.keys(item);
                      if (keys.length > 0) {
                        itemText = Object.values(item).filter(v => typeof v === 'string' || typeof v === 'number').map(v => String(v).trim()).filter(v => v).join(' ');
                        console.log(`[Export] Extracted from values:`, itemText);
                      }
                    }
                    
                    let result = itemText ? `<li>${itemText}` : '';
                    
                    // Add media if present
                    if (item.media && item.media.data) {
                      console.log(`[Export] Item ${idx} has media attachment:`, item.media);
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
                    console.log(`[Export] Final HTML for item ${idx}:`, result);
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
            console.log(`[Export] Processing array value for key "${key}":`, value);
            
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
              console.log(`[Export] Rendering object list for key "${key}":`, value);
              htmlContent += `
            <div class="subsection">
                <div class="subsection-title">${keyLabel}</div>
                <ul class="materials-list">
                    ${value.map((item, idx) => {
                      console.log(`[Export] [Subsection] Processing item ${idx} for key "${key}":`, item, 'Type:', typeof item);
                      
                      if (typeof item === 'string' || typeof item === 'number') {
                        console.log(`[Export] [Subsection] Item ${idx} is string/number:`, item);
                        const text = String(item).trim();
                        return text ? `<li>${text}</li>` : '';
                      } else if (typeof item === 'object' && item !== null) {
                        console.log(`[Export] [Subsection] Item ${idx} is object, keys:`, Object.keys(item));
                        console.log(`[Export] [Subsection] Item ${idx} values:`, Object.values(item));
                        
                        let itemText = (item.name || item.text || item.title || item.item || '').trim();
                        console.log(`[Export] [Subsection] Extracted itemText for ${idx}:`, itemText);
                        
                        if (item.quantity) {
                          itemText += ` (${item.quantity})`;
                        }
                        
                        if (item.notes) {
                          itemText += ` - ${item.notes}`;
                        }
                        
                        if (!itemText) {
                          console.log(`[Export] [Subsection] No itemText found for ${idx}, trying to extract from values`);
                          const keys = Object.keys(item);
                          if (keys.length > 0) {
                            itemText = Object.values(item).filter(v => typeof v === 'string' || typeof v === 'number').map(v => String(v).trim()).filter(v => v).join(' ');
                            console.log(`[Export] [Subsection] Extracted from values for ${idx}:`, itemText);
                          }
                        }
                        
                        const result = itemText ? `<li>${itemText}</li>` : '';
                        console.log(`[Export] [Subsection] Final HTML for item ${idx}:`, result);
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
      
      const htmlContent = generateHTML();
      
      
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm'; // A4 width
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
        
        // Calculate the y-offset for this page slice
        const yOffset = page * contentHeight;
        
        // Calculate how much of the image to show on this page
        const remainingHeight = imgHeight - yOffset;
        const pageContentHeight = Math.min(contentHeight, remainingHeight);
        
        // Add the image with proper positioning
        // The key is to use negative margin offset to "slide" the visible portion
        pdf.addImage(
          imgData, 
          'JPEG', 
          margin, 
          margin - yOffset,  // Negative offset to show the right part
          imgWidth, 
          imgHeight,
          undefined,
          'FAST'
        );
        
        // Add a white rectangle to hide content that should be on other pages
        if (page < totalPages - 1) {
          // Hide content below the current page
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

      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);
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
