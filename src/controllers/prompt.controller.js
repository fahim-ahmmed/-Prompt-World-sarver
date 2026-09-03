import Prompt from "../models/Prompt.js";

// Server-side Filtering, Search, Sorting, and Pagination
export const getPrompts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      search = "",
      category,
      aiTool,
      difficulty,
      sort = "latest"
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Filter Conditions
    const matchStage = { status: "approved" };

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { aiTool: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "All") matchStage.category = category;
    if (aiTool && aiTool !== "All") matchStage.aiTool = aiTool;
    if (difficulty && difficulty !== "All") matchStage.difficulty = difficulty;

    // Sorting Logic
    let sortStage = { createdAt: -1 };
    if (sort === "popular") sortStage = { copyCount: -1 };
    if (sort === "oldest") sortStage = { createdAt: 1 };

    // MongoDB Aggregation Pipeline
    const pipeline = [
      { $match: matchStage },
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: (pageNumber - 1) * limitNumber },
            { $limit: limitNumber },
            {
              $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creator"
              }
            },
            { $unwind: "$creator" },
            {
              $project: {
                title: 1,
                description: 1,
                category: 1,
                aiTool: 1,
                tags: 1,
                difficulty: 1,
                visibility: 1,
                copyCount: 1,
                createdAt: 1,
                "creator.name": 1,
                "creator.email": 1,
                "creator.photoURL": 1
              }
            }
          ]
        }
      }
    ];

    const result = await Prompt.aggregate(pipeline);

    const prompts = result[0].data;
    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    res.json({
      success: true,
      prompts,
      pagination: {
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};