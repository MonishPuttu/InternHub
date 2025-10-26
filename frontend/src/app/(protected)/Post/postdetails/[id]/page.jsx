import PostDetails from "@/modules/Post/postDetails";

export default function PostDetailsPage({ params }) {
  return <PostDetails postId={params.id} />;
}
