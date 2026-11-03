import "./LocalSaveNote.css";

type LocalSaveNoteProps = {
  saved: boolean | null;
};

function LocalSaveNote({ saved }: LocalSaveNoteProps) {
  if (saved === null) return null;

  return (
    <p className={`local-save-note ${saved ? "is-saved" : "save-failed"}`} aria-live="polite">
      {saved
        ? "Your bucket is saved on this device."
        : "Your bucket could not be saved on this device."}
    </p>
  );
}

export default LocalSaveNote;
