import Resource from '../models/Resource.js';
import University from '../models/University.js';
import { getAISummary, generateAIQuiz, parseNaturalLanguageQuery, chatWithStudyAssistant } from '../utils/aiHelper.js';

// @desc    AI Natural Language Search
// @route   POST /api/ai/search
// @access  Public
export const naturalLanguageSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const parseResult = parseNaturalLanguageQuery(query);
    const mongoQuery = { isApproved: true };

    // Find university matching the parsed name
    if (parseResult.university) {
      const uni = await University.findOne({
        $or: [
          { name: { $regex: parseResult.university, $options: 'i' } },
          { abbreviation: { $regex: parseResult.university, $options: 'i' } },
        ],
      });
      if (uni) {
        mongoQuery.university = uni._id;
      }
    }

    if (parseResult.year) {
      mongoQuery.year = parseResult.year;
    }

    if (parseResult.semester) {
      mongoQuery.semester = parseResult.semester;
    }

    if (parseResult.fileType) {
      mongoQuery.fileType = parseResult.fileType;
    }

    // Keyword matching
    if (parseResult.search) {
      mongoQuery.$or = [
        { title: { $regex: parseResult.search, $options: 'i' } },
        { description: { $regex: parseResult.search, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(mongoQuery)
      .populate('university', 'name abbreviation')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('uploadedBy', 'name avatar');

    res.json({
      query: parseResult,
      results: resources,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI summary of PDF
// @route   POST /api/ai/summarize/:resourceId
// @access  Private
export const summarizeResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Return existing if already calculated
    if (resource.aiSummary) {
      return res.json({ summary: resource.aiSummary });
    }

    const summary = await getAISummary(resource.title, resource.description);
    resource.aiSummary = summary;
    await resource.save();

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI quiz questions
// @route   POST /api/ai/quiz/:resourceId
// @access  Private
export const generateQuiz = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const quiz = await generateAIQuiz(resource.title, resource.description);
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chat with Study Assistant
// @route   POST /api/ai/chat
// @access  Private
export const chatAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const reply = await chatWithStudyAssistant(message, history);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
