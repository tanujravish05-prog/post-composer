import { format, addDays, subDays } from 'date-fns';

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');
const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
const inThreeDaysStr = format(addDays(today, 3), 'yyyy-MM-dd');
const inFiveDaysStr = format(addDays(today, 5), 'yyyy-MM-dd');
const nextWeekStr = format(addDays(today, 7), 'yyyy-MM-dd');

export const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: '🚀 Launch Announcement: NextGen React AI Tools',
    content: 'We are thrilled to reveal our brand new developer productivity suite powered by cutting-edge state management & UI virtualization! #ReactJS #WebDev #AI',
    platform: 'twitter',
    scheduledDate: todayStr,
    scheduledTime: '10:00',
    status: 'scheduled',
    tags: ['Launch', 'React', 'DevTools'],
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    engagementEstimate: '850+ engagements'
  },
  {
    id: 'post-2',
    title: '📸 Behind The Scenes: Engineering Team Sync',
    content: 'Deep dive into optimizing rendering cycles with React.memo and Redux Toolkit slices! Slide to see our design system blueprints 🎨',
    platform: 'instagram',
    scheduledDate: todayStr,
    scheduledTime: '14:30',
    status: 'scheduled',
    tags: ['TeamCulture', 'Engineering', 'UIUX'],
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    engagementEstimate: '1.2k likes'
  },
  {
    id: 'post-3',
    title: '💼 How Memoization Reduces UI Latency by 40%',
    content: 'In complex dashboard interfaces like calendar schedulers, unnecessary re-renders degrade user experience. Read our technical breakdown on using useMemo & useCallback effectively.',
    platform: 'linkedin',
    scheduledDate: yesterdayStr,
    scheduledTime: '11:00',
    status: 'published',
    tags: ['Performance', 'SoftwareEngineering', 'WebPerf'],
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    engagementEstimate: '340 impressions'
  },
  {
    id: 'post-4',
    title: '🎥 Masterclass: Building Redux Toolkit State Trees',
    content: 'New video alert! Learn how to map temporal data directly into temporal grid layouts with drag-and-drop actions.',
    platform: 'youtube',
    scheduledDate: tomorrowStr,
    scheduledTime: '16:00',
    status: 'scheduled',
    tags: ['Tutorial', 'Redux', 'Frontend'],
    mediaUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    engagementEstimate: '3.5k views'
  },
  {
    id: 'post-5',
    title: '💡 Weekly UX Tip: Visualizing Time-Based Data',
    content: 'When designing calendar schedulers, visual hierarchy matters. Color-coded platform badges improve scannability by 60%.',
    platform: 'facebook',
    scheduledDate: inThreeDaysStr,
    scheduledTime: '09:15',
    status: 'draft',
    tags: ['UXDesign', 'Tips', 'ContentStrategy'],
    mediaUrl: null,
    engagementEstimate: 'Draft'
  },
  {
    id: 'post-6',
    title: '🧵 Thread: 5 Lessons from CO4 Performance Engineering',
    content: '1/5 Profiling React components with devtools... 2/5 Isolating local state mutations... 3/5 Memoizing drag targets!',
    platform: 'threads',
    scheduledDate: inFiveDaysStr,
    scheduledTime: '18:45',
    status: 'scheduled',
    tags: ['TechThread', 'Performance'],
    mediaUrl: null,
    engagementEstimate: '500+ retweets'
  },
  {
    id: 'post-7',
    title: '📊 Q3 Content Planning Strategy Session',
    content: 'Preparing our cross-channel distribution schedule for upcoming feature drops across X, LinkedIn, and YouTube.',
    platform: 'linkedin',
    scheduledDate: nextWeekStr,
    scheduledTime: '13:00',
    status: 'draft',
    tags: ['Strategy', 'Planning'],
    mediaUrl: null,
    engagementEstimate: 'Draft'
  }
];
