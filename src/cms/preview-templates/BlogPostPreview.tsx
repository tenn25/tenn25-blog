import React from 'react';
const BlogPostPreview: React.FC = ({ widgetFor }: any) => <p>{widgetFor('body')}</p>;
export default BlogPostPreview;
