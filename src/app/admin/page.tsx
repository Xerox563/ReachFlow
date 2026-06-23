"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Search, Filter, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { ReferencePost, Category } from "@/types";

export default function AdminDashboard() {
  const [posts, setPosts] = useState<ReferencePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/reference-posts');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(search.toLowerCase()) ||
    post.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reference Library</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage high-performing LinkedIn posts for AI training.</p>
          </div>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Post
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Add Reference Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Post Content</label>
                  <textarea 
                    className="w-full h-32 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Paste the LinkedIn post here..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Category</label>
                    <select className="w-full p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option>Founder</option>
                      <option>Storytelling</option>
                      <option>Career Growth</option>
                      <option>AI</option>
                      <option>Sales</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Author</label>
                    <Input placeholder="e.g. Justin Welsh" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Hook Tag</label>
                    <Input placeholder="e.g. Question" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Structure Tag</label>
                    <Input placeholder="e.g. Listicle" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Content Tag</label>
                    <Input placeholder="e.g. Educational" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="border-gray-200 dark:border-gray-700">Cancel</Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">Save Post</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-900 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-900 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">6</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-gray-900 border-none shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-gray-900 dark:text-white">Library Posts</CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search posts..." 
                    className="pl-10 w-[300px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="border-gray-200 dark:border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead className="text-gray-500 dark:text-gray-400">Content Preview</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Tags</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Author</TableHead>
                  <TableHead className="text-right text-gray-500 dark:text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading posts...
                    </TableCell>
                  </TableRow>
                ) : filteredPosts.length === 0 ? (
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No posts found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post, index) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                    >
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{post.content}</p>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-medium border border-orange-100 dark:border-orange-900/50">
                          {post.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                            {post.tags.hook}
                          </span>
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                            {post.tags.structure}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900 dark:text-white">{post.author || 'Unknown'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-orange-500">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
