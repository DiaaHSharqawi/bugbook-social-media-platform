import { postEditorTranslations } from "@/lib/translationKeys";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslations } from "next-intl";

export default function usePostEditor() {
  const t = useTranslations();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: t(postEditorTranslations.placeholder),
      }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  return { editor, input };
}
