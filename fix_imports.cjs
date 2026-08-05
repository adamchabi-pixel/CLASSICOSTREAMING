const fs = require('fs');
let content = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf8');

content = content.replace('import { Download, CheckCircle as CheckCircle2, motion, AnimatePresence } from "motion/react";', 'import { motion, AnimatePresence } from "motion/react";');
content = content.replace('import { Plus, Play, ChevronDown, Award, Users, Film, ArrowLeft, Star, Clock, Heart, X, User, ChevronLeft, ChevronRight } from "lucide-react";', 'import { Plus, Play, ChevronDown, Award, Users, Film, ArrowLeft, Star, Clock, Heart, X, User, ChevronLeft, ChevronRight, Download, CheckCircle } from "lucide-react";');

fs.writeFileSync('src/components/MovieDetailView.tsx', content);
