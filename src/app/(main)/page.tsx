import TrendsSidebar from "@/components/customComponents/TrendsSidebar/TrendsSidebar";
import PostEditor from "@/components/posts/components/editor/PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLocaleSettings } from "@/hooks/useLocaleSettings";
import {
  followingFeedTranslations,
  forYouFeedTranslations,
} from "@/lib/translationKeys";
import { getTranslations } from "next-intl/server";
import ForYouFeed from "./forYouFeed/ForYouFeed";
import FollowingFeed from "./users/components/followingFeed/FollowingFeed";

export default async function Home() {
  const t = await getTranslations();
  const { direction } = await getLocaleSettings();

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <Tabs defaultValue="for-you" dir={direction}>
          <TabsList>
            <TabsTrigger value="for-you">
              {t(forYouFeedTranslations.title)}
            </TabsTrigger>
            <TabsTrigger value="following">
              {t(followingFeedTranslations.title)}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            {" "}
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
