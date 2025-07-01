export default function SideContent() {
  return (
    <div className="h-full">
      <h3 className="text-2xl font-bold mb-4">Sidebar</h3>
      <div className="space-y-4">
        {/* Placeholder sidebar content: get it? Light – Lumen haha I am a friggin genius */}
        <div className="pb-4">
          <h4 className="font-semibold mb-2">Light Verse</h4>
          <p className="text-sm">Thine website doth be cwazy</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Light Damage</h4>
          <p className="text-sm">
            Why did the photo go to jail?
            <br />
            <span className="italic">Because it was framed!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
