const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { query } = require('../db/index');

// Get all email templates
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { type, active } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (active !== undefined) {
      whereConditions.push(`is_active = $${paramIndex}`);
      queryParams.push(active === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        id, name, type, subject, body, variables, 
        is_active, created_at, updated_at
      FROM EmailTemplates 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await query(query, queryParams);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des templates'
    });
  }
});

// Get single email template
router.get('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM EmailTemplates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du template'
    });
  }
});

// Create new email template
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const {
      name,
      type,
      subject,
      body,
      variables = [],
      is_active = true
    } = req.body;

    // Validate required fields
    if (!name || !type || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants: name, type, subject, body'
      });
    }

    // Check if template with same name already exists
    const existingTemplate = await query(
      'SELECT id FROM EmailTemplates WHERE name = $1',
      [name]
    );

    if (existingTemplate.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un template avec ce nom existe déjà'
      });
    }

    const insertQuery = `
      INSERT INTO EmailTemplates (
        name, type, subject, body, variables, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(insertQuery, [
      name, type, subject, body, JSON.stringify(variables), is_active
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Template créé avec succès'
    });
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du template'
    });
  }
});

// Update email template
router.patch('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = ['name', 'type', 'subject', 'body', 'variables', 'is_active'];
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(field => {
      if (allowedFields.includes(field)) {
        if (field === 'variables' && Array.isArray(updates[field])) {
          updateFields.push(`${field} = $${paramIndex}`);
          queryParams.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = $${paramIndex}`);
          queryParams.push(updates[field]);
        }
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ valide à mettre à jour'
      });
    }

    // Check if name is being updated and already exists
    if (updates.name) {
      const existingTemplate = await query(
        'SELECT id FROM EmailTemplates WHERE name = $1 AND id != $2',
        [updates.name, id]
      );

      if (existingTemplate.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Un template avec ce nom existe déjà'
        });
      }
    }

    updateFields.push(`updated_at = NOW()`);
    queryParams.push(id);

    const updateQuery = `
      UPDATE EmailTemplates 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Template mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du template'
    });
  }
});

// Delete email template
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM EmailTemplates WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Template supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du template'
    });
  }
});

// Preview email template with data
router.post('/:id/preview', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data = {} } = req.body;

    // Get template
    const templateResult = await query(
      'SELECT * FROM EmailTemplates WHERE id = $1',
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }

    const template = templateResult.rows[0];
    let { subject, body } = template;

    // Replace variables in subject and body
    const variables = JSON.parse(template.variables || '[]');
    
    variables.forEach(variable => {
      const placeholder = `{{${variable}}}`;
      const value = data[variable] || `[${variable}]`;
      
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    res.json({
      success: true,
      data: {
        subject,
        body,
        variables: template.variables,
        preview_data: data
      }
    });
  } catch (error) {
    console.error('Error previewing email template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la prévisualisation du template'
    });
  }
});

// Get template types
router.get('/types/list', protect, isAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT DISTINCT type FROM EmailTemplates ORDER BY type'
    );

    const types = result.rows.map(row => row.type);

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error fetching template types:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des types'
    });
  }
});

module.exports = router;