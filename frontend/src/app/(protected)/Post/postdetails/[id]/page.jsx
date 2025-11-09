import PostDetails from "@/modules/Post/postDetails";

export default async function PostDetailsPage({ params }) {
  const { id } = await params;
  return <PostDetails postId={id} />;
}
