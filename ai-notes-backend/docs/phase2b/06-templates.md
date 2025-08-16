# Templates API

Template management system with variable processing and content generation.

## 📋 Overview

The templates system provides reusable note templates with dynamic variable substitution. Users can create templates with placeholders and generate new notes from these templates with custom content.

### Features
- ✅ Template creation with variable placeholders
- ✅ Variable processing and substitution
- ✅ Public template marketplace
- ✅ Template analytics and usage tracking
- ✅ Background template processing
- ✅ Template validation and optimization

## 🔐 Endpoints

All endpoints require:
- Authorization: Bearer <jwt_token>
- Guard: JwtAuthGuard

### GET /templates/my-templates

Get the authenticated user's templates (optionally include public).

Query:
- includePublic (boolean, optional)
- category (string, optional)
- tags (comma-separated string, optional)
- limit (number, optional)

Success (200):
```json
{
  "success": true,
  "templates": [{ "id": "tpl_1", "name": "Meeting Notes", "isPublic": false }],
  "count": 1
}
```

---

### GET /templates/public

Get public templates marketplace.

Query:
- category (string, optional)
- tags (comma-separated string, optional)
- difficulty (string, optional)
- search (string, optional)
- limit (number, optional)

Success (200):
```json
{
  "success": true,
  "templates": [{ "id": "tpl_pub", "name": "Daily Journal", "isPublic": true }],
  "count": 1,
  "filters": { "category": "personal", "tags": ["journal"] }
}
```

---

### GET /templates/categories

Get template categories (counts).

Success (200):
```json
{
  "success": true,
  "categories": [{ "name": "work", "count": 5 }]
}
```

---

### GET /templates/recommendations

Get recommended templates for the user.

Query:
- limit (number, optional, default: 5)

Success (200):
```json
{
  "success": true,
  "recommendations": [{ "id": "tpl_rec", "name": "Weekly Review" }],
  "count": 1
}
```

---

### GET /templates/search

Search templates (user + optional public).

Query:
- q (string, required)
- includePublic (boolean, optional)
- limit (number, optional)

Success (200):
```json
{
  "success": true,
  "templates": [{ "id": "tpl_x", "name": "Project Plan" }],
  "count": 1,
  "query": "plan"
}
```

---

### POST /templates

Create a new template.

Body:
```json
{
  "name": "Project Planning Template",
  "description": "Comprehensive project plan",
  "content": "# {{project_name}} ...",
  "tags": ["project", "planning"],
  "isPublic": false,
  "metadata": { "category": "planning" }
}
```

Success (201):
```json
{
  "success": true,
  "template": { "id": "tpl_new", "name": "Project Planning Template" },
  "message": "Template created successfully"
}
```

---

### GET /templates/:templateId

Get template by ID.

Success (200):
```json
{
  "success": true,
  "template": { "id": "tpl_1", "name": "Meeting Notes" }
}
```

Not found (200):
```json
{ "success": false, "template": null, "error": "Template not found or not accessible" }
```

---

### PUT /templates/:templateId

Update template.

Body (any subset):
```json
{ "name": "Meeting Notes (Updated)", "content": "# {{title}}", "isPublic": true, "metadata": { "category": "work" } }
```

Success (200):
```json
{
  "success": true,
  "template": { "id": "tpl_1", "name": "Meeting Notes (Updated)" },
  "message": "Template updated successfully"
}
```

---

### DELETE /templates/:templateId

Delete a template.

Success (200):
```json
{ "success": true, "message": "Template \"Meeting Notes\" deleted successfully" }
```

---

### POST /templates/:templateId/process

Process a template with variables (no note creation).

Body:
```json
{ "variables": { "title": "Weekly Standup", "date": "2024-01-15" } }
```

Success (200):
```json
{
  "success": true,
  "processed": {
    "id": "tpl_1",
    "processedContent": "# Weekly Standup\n\n**Date:** 2024-01-15\n..."
  },
  "message": "Template processed successfully"
}
```

---

### POST /templates/:templateId/duplicate

Duplicate a template.

Body (optional):
```json
{ "newName": "Meeting Notes (Copy)" }
```

Success (201):
```json
{
  "success": true,
  "template": { "id": "tpl_copy", "name": "Meeting Notes (Copy)" },
  "message": "Template duplicated successfully"
}
```

---

### GET /templates/:templateId/stats

Get usage statistics for a template.

Success (200):
```json
{
  "success": true,
  "stats": {
    "totalUses": 10,
    "uniqueUsers": 3,
    "averageRating": 4.2,
    "usageByCategory": {},
    "popularVariables": [{ "name": "title", "frequency": 8 }],
    "timeToComplete": 15
  }
}
```

---

### GET /templates/:templateId/preview

Generate a preview using sample variables.

Success (200):
```json
{
  "success": true,
  "preview": {
    "id": "tpl_1",
    "processedContent": "# Sample Title\n\n..."
  }
}
```

## Notes

- DELETE returns 200 with JSON (not 204).
- Use /templates/:templateId/process to render content; note creation from template is not provided in this API.
- Variables are auto-detected from content; optional metadata can include category/difficulty/etc.

## 🔧 Template System Features

### Variable Processing Engine

The system supports multiple variable types with intelligent processing:

```typescript
interface TemplateVariable {
  name: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  options?: string[]; // For select type
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}
```

### Dynamic Variables

System-provided variables that are automatically resolved:

- `{{today}}` - Current date (YYYY-MM-DD)
- `{{time}}` - Current time (HH:MM)  
- `{{datetime}}` - Current datetime (ISO string)
- `{{user_name}}` - Current user's name
- `{{user_email}}` - Current user's email
- `{{workspace_name}}` - Current workspace name

### Variable Processing Algorithm

```typescript
const processTemplate = (template: string, variables: Record<string, any>) => {
  let processed = template;
  
  // 1. Process user-provided variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, value || `[${key}]`);
  });
  
  // 2. Process dynamic variables
  processed = processed.replace(/{{today}}/g, getCurrentDate());
  processed = processed.replace(/{{time}}/g, getCurrentTime());
  processed = processed.replace(/{{user_name}}/g, user.name);
  
  // 3. Handle empty variables with prompts
  processed = processed.replace(/{{(\w+)}}/g, (match, varName) => {
    return `*[Add ${varName.replace(/_/g, ' ')} here]*`;
  });
  
  return processed;
};
```

### Template Categories

**Work & Business:**
- Meeting notes
- Project planning
- Status reports
- Proposals
- Documentation

**Personal:**
- Daily journals
- Goal tracking
- Learning notes
- Travel planning
- Health tracking

**Education:**
- Lecture notes
- Research templates
- Study guides
- Assignment outlines
- Project documentation

**Creative:**
- Story outlines
- Character profiles
- Blog post templates
- Recipe formats
- Art project planning

## 🧪 Testing Examples

### Manual Testing with cURL

**Create template:**
```bash
curl -X POST http://localhost:3001/api/templates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Template",
    "description": "A simple test template",
    "content": "# {{title}}\n\n{{content}}\n\n**Created by:** {{user_name}}",
    "tags": ["test"]
  }'
```

**Use template:**
```bash
curl -X POST http://localhost:3001/api/templates/TEMPLATE_ID/use \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "WORKSPACE_ID",
    "variables": {
      "title": "My Test Note",
      "content": "This is test content from a template"
    }
  }'
```

**Get public templates:**
```bash
curl -X GET "http://localhost:3001/api/templates/public?category=work&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Preview template:**
```bash
curl -X POST http://localhost:3001/api/templates/TEMPLATE_ID/preview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "title": "Preview Title"
    },
    "useSampleData": true
  }'
```

## 🔄 Background Processing

### Queue Jobs

The system uses BullMQ for template-related background processing:

```typescript
// Queue job types
{
  "analyze-template": {
    "templateId": "cm4template123",
    "userId": "cm4user123",
    "tasks": ["extract_variables", "categorize", "estimate_time"]
  },
  "optimize-template-performance": {
    "templateId": "cm4template123",
    "optimizations": ["variable_validation", "content_compression"]
  },
  "generate-template-suggestions": {
    "userId": "cm4user123",
    "basedOn": "usage_patterns",
    "limit": 5
  },
  "cleanup-unused-templates": {
    "userId": "cm4user123",
    "olderThanDays": 90,
    "keepPublic": true
  }
}
```

### Maintenance Jobs

- **Daily**: Update usage statistics and analytics
- **Weekly**: Analyze template performance and generate insights
- **Monthly**: Suggest template optimizations and cleanup
- **Quarterly**: Generate usage reports and recommendations

## 🎯 Advanced Features

### Smart Variable Detection

The system automatically detects variables in template content:

```typescript
const extractVariables = (content: string) => {
  const variablePattern = /{{(\w+)}}/g;
  const variables = [];
  let match;
  
  while ((match = variablePattern.exec(content)) !== null) {
    const variableName = match[1];
    const inferredType = inferVariableType(variableName);
    
    variables.push({
      name: variableName,
      type: inferredType,
      label: formatLabel(variableName),
      required: true
    });
  }
  
  return variables;
};

const inferVariableType = (name: string) => {
  if (name.includes('date')) return 'date';
  if (name.includes('time')) return 'time';
  if (name.includes('email')) return 'email';
  if (name.includes('description') || name.includes('notes')) return 'textarea';
  return 'text';
};
```

### Template Validation

```typescript
const validateTemplate = (template: Template) => {
  const issues = [];
  
  // Check for unclosed variables
  const unclosedVars = template.content.match(/{{[^}]*$/g);
  if (unclosedVars) {
    issues.push('Unclosed variable brackets found');
  }
  
  // Check for duplicate variables
  const variables = extractVariables(template.content);
  const duplicates = findDuplicates(variables.map(v => v.name));
  if (duplicates.length > 0) {
    issues.push(`Duplicate variables: ${duplicates.join(', ')}`);
  }
  
  // Check content length
  if (template.content.length > 50000) {
    issues.push('Template content is very large (>50KB)');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    score: calculateQualityScore(template)
  };
};
```

### Template Marketplace

Public templates include additional features:

- **Rating System**: User ratings and reviews
- **Usage Statistics**: Download and usage counts
- **Verification Badges**: Verified high-quality templates
- **Categories**: Organized browsing experience
- **Search**: Full-text search across public templates

## ❌ Common Issues and Solutions

### Issue: "Variables not being substituted"
**Cause:** Incorrect variable syntax or missing variables
**Solution:** Check variable names match exactly and use proper {{variable}} syntax

### Issue: "Template content too large"
**Cause:** Template content exceeds size limits
**Solution:** Break large templates into smaller, focused templates

### Issue: "Variable type validation failing"
**Cause:** Provided variable values don't match expected type
**Solution:** Ensure date variables use YYYY-MM-DD format, numbers are numeric

### Issue: "Template not found in public marketplace"
**Cause:** Template not marked as public or doesn't meet quality standards
**Solution:** Ensure isPublic=true and template has proper metadata

## 📊 Template Quality Metrics

### Quality Scoring Algorithm

```typescript
const calculateQualityScore = (template: Template) => {
  let score = 0;
  
  // Content quality (40%)
  score += Math.min(template.content.length / 1000, 1) * 40;
  
  // Variable usage (30%)
  const variables = extractVariables(template.content);
  score += Math.min(variables.length / 5, 1) * 30;
  
  // Metadata completeness (20%)
  const metadataFields = ['description', 'category', 'tags'];
  const completedFields = metadataFields.filter(field => template[field]).length;
  score += (completedFields / metadataFields.length) * 20;
  
  // Usage and engagement (10%)
  score += Math.min(template.usage?.totalUses || 0 / 50, 1) * 10;
  
  return Math.round(score);
};
```

### Template Insights

The system provides AI-powered insights:
- **Optimization Suggestions**: Improve variable naming and content structure
- **Usage Patterns**: When and how templates are most commonly used
- **Content Analysis**: Readability and completeness scores
- **Performance Metrics**: Load time and processing efficiency

---

**Next:** [Attachments API](./07-attachments.md)
