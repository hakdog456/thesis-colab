import { v4 as uuidv4 } from 'uuid';

// ── Users ─────────────────────────────────────────────
export const users = [
  {
    id: 'user-dustin',
    name: 'Dustin',
    email: 'dustin@thesis.edu',
    avatar: null,
    color: '#3B82F6',
    colorClass: 'blue',
    initials: 'DT',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'user-kyran',
    name: 'Kyran',
    email: 'kyran@thesis.edu',
    avatar: null,
    color: '#8B5CF6',
    colorClass: 'purple',
    initials: 'KR',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'user-renz',
    name: 'Renz',
    email: 'renz@thesis.edu',
    avatar: null,
    color: '#10B981',
    colorClass: 'green',
    initials: 'RZ',
    createdAt: '2025-01-15T08:00:00Z',
  },
];

// ── Block IDs (stable UUIDs) ──────────────────────────
const BLOCK_IDS = {
  // Chapter 1
  ch1_title: uuidv4(),
  ch1_intro_title: uuidv4(),
  ch1_intro_p1: uuidv4(),
  ch1_intro_p2: uuidv4(),
  ch1_bg_title: uuidv4(),
  ch1_bg_p1: uuidv4(),
  ch1_bg_p2: uuidv4(),
  ch1_sop_title: uuidv4(),
  ch1_sop_p1: uuidv4(),
  // Chapter 2
  ch2_title: uuidv4(),
  ch2_rs_title: uuidv4(),
  ch2_rs_p1: uuidv4(),
  ch2_rs_p2: uuidv4(),
  ch2_es_title: uuidv4(),
  ch2_es_p1: uuidv4(),
  ch2_jc_title: uuidv4(),
  ch2_jc_p1: uuidv4(),
  ch2_jc_p2: uuidv4(),
  ch2_rg_title: uuidv4(),
  ch2_rg_p1: uuidv4(),
  ch2_rg_p2: uuidv4(),
  // Chapter 3
  ch3_title: uuidv4(),
  ch3_meth_title: uuidv4(),
  ch3_meth_p1: uuidv4(),
  ch3_sa_title: uuidv4(),
  ch3_sa_p1: uuidv4(),
};

// ── Sample Thesis Document (Tiptap JSON) ──────────────
export const sampleDocument = {
  id: 'doc-1',
  title: 'Joinable Column Discovery Using Embedding-Based Similarity',
  createdAt: '2025-02-01T10:00:00Z',
  updatedAt: '2025-09-20T14:30:00Z',
  currentVersionId: 'ver-1',
  content: {
    type: 'doc',
    content: [
      // ── Chapter 1: Introduction ──
      {
        type: 'heading',
        attrs: { level: 1, blockId: BLOCK_IDS.ch1_title },
        content: [{ type: 'text', text: 'Chapter 1: Introduction' }],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch1_intro_title },
        content: [{ type: 'text', text: '1.1 Introduction' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch1_intro_p1 },
        content: [
          {
            type: 'text',
            text: 'The exponential growth of data across organizations has created an urgent need for tools that can automatically discover relationships between disparate datasets. Data integration — the process of combining data from different sources into a unified view — remains one of the most time-consuming and error-prone tasks in data engineering pipelines.',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch1_intro_p2 },
        content: [
          {
            type: 'text',
            text: 'A fundamental operation in data integration is identifying columns across tables that can be meaningfully joined. Traditional approaches rely on schema matching, which compares column names and data types. However, these methods fail when columns share semantic meaning but differ in naming conventions — a common occurrence in real-world data lakes with hundreds of independently maintained tables.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch1_bg_title },
        content: [{ type: 'text', text: '1.2 Background of the Study' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch1_bg_p1 },
        content: [
          {
            type: 'text',
            text: 'Column joinability refers to the degree to which two columns from different tables can produce a meaningful result when used as join keys. Unlike exact-match joins which require identical values, semantic joinability considers whether columns represent the same real-world concept. For example, a column named "product_id" in one table and "item_code" in another may contain overlapping or equivalent values suitable for joining.',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch1_bg_p2 },
        content: [
          {
            type: 'text',
            text: 'Recent advances in natural language processing, particularly pre-trained language models such as BERT and its derivatives, have shown promise in capturing semantic relationships between textual data. These models generate dense vector representations (embeddings) that encode contextual meaning, enabling similarity comparisons that go beyond surface-level string matching.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch1_sop_title },
        content: [{ type: 'text', text: '1.3 Statement of the Problem' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch1_sop_p1 },
        content: [
          {
            type: 'text',
            text: 'Despite the availability of embedding-based similarity measures, no comprehensive system exists that leverages column-level embeddings to automatically discover joinable columns across large collections of heterogeneous tables. Current systems either rely on exact value overlap (limiting recall) or require manual schema alignment (limiting scalability). This research addresses the gap by developing an automated joinable column discovery system that uses embedding-based similarity to identify semantically compatible columns for data integration.',
          },
        ],
      },

      // ── Chapter 2: Review of Related Literature ──
      {
        type: 'heading',
        attrs: { level: 1, blockId: BLOCK_IDS.ch2_title },
        content: [{ type: 'text', text: 'Chapter 2: Review of Related Literature' }],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch2_rs_title },
        content: [{ type: 'text', text: '2.1 Related Studies' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch2_rs_p1 },
        content: [
          {
            type: 'text',
            text: 'Zhu et al. (2019) introduced JOSIE, a system for set similarity joins that identifies unionable tables by comparing value overlap between columns. The system uses an inverted index and cost-based optimization to efficiently find top-k similar columns in large table corpora. While effective for exact value matching, JOSIE does not capture semantic similarity between values with different surface forms.',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch2_rs_p2 },
        content: [
          {
            type: 'text',
            text: 'Fernandez et al. (2018) developed Aurum, a data discovery system that builds a graph of relationships between datasets using various signals including schema names, value overlap, and statistical profiles. Aurum enables users to discover related datasets through graph traversal, but its reliance on pre-computed pairwise comparisons limits its scalability to very large data lakes.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch2_es_title },
        content: [{ type: 'text', text: '2.2 Existing Systems' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch2_es_p1 },
        content: [
          {
            type: 'text',
            text: 'Several existing systems have attempted to address the challenge of joinable column discovery. Google Dataset Search provides keyword-based dataset discovery but does not offer column-level join recommendations. Auctus (Castelo et al., 2021) combines multiple discovery signals including value overlap, temporal alignment, and spatial proximity to recommend augmentable datasets. Microsoft\'s Table Union Search uses a combination of schema and instance similarity to find unionable tables, employing locality-sensitive hashing for efficiency.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch2_jc_title },
        content: [{ type: 'text', text: '2.3 Joinable Columns' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch2_jc_p1 },
        content: [
          {
            type: 'text',
            text: 'The concept of joinable columns extends beyond simple key-foreign key relationships. Two columns are considered joinable when their values can be meaningfully combined to produce useful analytical results. This includes exact joins (identical values), fuzzy joins (approximately matching values), and semantic joins (conceptually equivalent values).',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch2_jc_p2 },
        content: [
          {
            type: 'text',
            text: 'Khatiwada et al. (2022) formalized the notion of joinability using set containment and introduced the concept of join key discovery, which identifies not only which columns can be joined but also the optimal join condition (e.g., equality, range, or fuzzy matching). Their work highlights the importance of considering data distributions and value domains when assessing column compatibility.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch2_rg_title },
        content: [{ type: 'text', text: '2.4 Research Gap' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch2_rg_p1 },
        content: [
          {
            type: 'text',
            text: 'While the literature presents various approaches to data discovery and column matching, a significant gap remains in the application of modern embedding techniques to joinable column discovery. Existing systems primarily rely on syntactic similarity (exact or fuzzy string matching) or statistical profiles (value distributions, cardinality). Few systems leverage the rich semantic representations offered by pre-trained language models to capture the contextual meaning of column values.',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch2_rg_p2 },
        content: [
          {
            type: 'text',
            text: 'Several existing systems rely on outdated methods that fail to capture the nuanced semantic relationships between column values. These traditional approaches are limited in their ability to handle heterogeneous data sources with varying naming conventions and data formats. The lack of a unified framework that combines embedding-based similarity with efficient indexing structures presents a clear opportunity for advancing the state of the art in automated data integration.',
          },
        ],
      },

      // ── Chapter 3: Methodology ──
      {
        type: 'heading',
        attrs: { level: 1, blockId: BLOCK_IDS.ch3_title },
        content: [{ type: 'text', text: 'Chapter 3: Methodology' }],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch3_meth_title },
        content: [{ type: 'text', text: '3.1 Research Methodology' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch3_meth_p1 },
        content: [
          {
            type: 'text',
            text: 'This study employs a design science research methodology, following the iterative build-evaluate cycle proposed by Hevner et al. (2004). The research artifact is a software system for joinable column discovery. The evaluation phase uses both synthetic benchmarks and real-world data lake corpora to assess the system\'s effectiveness in discovering joinable columns compared to baseline approaches.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2, blockId: BLOCK_IDS.ch3_sa_title },
        content: [{ type: 'text', text: '3.2 System Architecture' }],
      },
      {
        type: 'paragraph',
        attrs: { blockId: BLOCK_IDS.ch3_sa_p1 },
        content: [
          {
            type: 'text',
            text: 'The proposed system consists of four main components: (1) a Column Profiler that extracts metadata and sample values from each column; (2) an Embedding Generator that produces dense vector representations using a fine-tuned BERT model; (3) an Approximate Nearest Neighbor (ANN) Index built using FAISS for efficient similarity search; and (4) a Join Recommender that ranks candidate column pairs by their estimated joinability score. The system processes tables in batch mode and maintains a persistent index for incremental updates.',
          },
        ],
      },
    ],
  },
};

// Expose BLOCK_IDS for task anchoring
export { BLOCK_IDS };

// ── Sample Tasks ──────────────────────────────────────
export const sampleTasks = [
  {
    id: 'task-1',
    documentId: 'doc-1',
    title: 'Improve Research Gap analysis',
    description: 'The research gap section needs stronger justification for why embedding-based approaches are necessary. Add specific metrics or references to show the limitations of existing methods.',
    priority: 'high',
    status: 'in_progress',
    ownerId: 'user-dustin',
    createdBy: 'user-kyran',
    target: {
      chapterId: 'Chapter 2',
      sectionId: '2.4 Research Gap',
      blockId: BLOCK_IDS.ch2_rg_p1,
      anchorText: 'While the literature presents various approaches to data discovery and column matching, a significant gap remains in the application of modern embedding techniques to joinable column discovery.',
      startOffset: 0,
      endOffset: 178,
      targetStatus: 'valid',
    },
    dueDate: '2025-10-01T00:00:00Z',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-09-20T14:00:00Z',
  },
  {
    id: 'task-2',
    documentId: 'doc-1',
    title: 'Fix Khatiwada citation format',
    description: 'The citation for Khatiwada et al. (2022) needs to be updated to the correct format per the thesis guidelines. Also verify the year — some sources cite it as 2023.',
    priority: 'medium',
    status: 'available',
    ownerId: null,
    createdBy: 'user-dustin',
    target: {
      chapterId: 'Chapter 2',
      sectionId: '2.3 Joinable Columns',
      blockId: BLOCK_IDS.ch2_jc_p2,
      anchorText: 'Khatiwada et al. (2022) formalized the notion of joinability using set containment',
      startOffset: 0,
      endOffset: 82,
      targetStatus: 'valid',
    },
    dueDate: '2025-09-28T00:00:00Z',
    createdAt: '2025-09-18T09:00:00Z',
    updatedAt: '2025-09-18T09:00:00Z',
  },
  {
    id: 'task-3',
    documentId: 'doc-1',
    title: 'Remove redundant paragraph in Research Gap',
    description: 'The second paragraph in Section 2.4 largely repeats points already made in the first paragraph. Remove it to tighten the argument.',
    priority: 'low',
    status: 'available',
    ownerId: null,
    createdBy: 'user-dustin',
    target: {
      chapterId: 'Chapter 2',
      sectionId: '2.4 Research Gap',
      blockId: BLOCK_IDS.ch2_rg_p2,
      anchorText: 'Several existing systems rely on outdated methods that fail to capture the nuanced semantic relationships between column values.',
      startOffset: 0,
      endOffset: 127,
      targetStatus: 'valid',
    },
    dueDate: '2025-10-05T00:00:00Z',
    createdAt: '2025-09-19T11:00:00Z',
    updatedAt: '2025-09-19T11:00:00Z',
  },
];

// ── Initial Version ───────────────────────────────────
export const sampleVersions = [
  {
    id: 'ver-1',
    documentId: 'doc-1',
    versionNumber: 1,
    content: JSON.parse(JSON.stringify(sampleDocument.content)), // deep clone
    createdBy: 'user-dustin',
    reviewedBy: null,
    changeRequestId: null,
    changeSummary: 'Initial thesis draft',
    createdAt: '2025-02-01T10:00:00Z',
  },
];

// ── Sample Comments ───────────────────────────────────
export const sampleComments = [
  {
    id: 'comment-1',
    documentId: 'doc-1',
    taskId: 'task-1',
    changeRequestId: null,
    blockId: BLOCK_IDS.ch2_rg_p1,
    startOffset: null,
    endOffset: null,
    authorId: 'user-kyran',
    content: 'The research gap needs to be more specific about what embedding approaches have been tried and where they fall short. Consider adding a comparison table.',
    status: 'open',
    parentCommentId: null,
    createdAt: '2025-09-15T10:30:00Z',
  },
  {
    id: 'comment-2',
    documentId: 'doc-1',
    taskId: 'task-1',
    changeRequestId: null,
    blockId: BLOCK_IDS.ch2_rg_p1,
    startOffset: null,
    endOffset: null,
    authorId: 'user-dustin',
    content: 'Good point. I\'ll add quantitative comparisons from the SANTOS and Starmie papers.',
    status: 'open',
    parentCommentId: 'comment-1',
    createdAt: '2025-09-15T11:00:00Z',
  },
];
