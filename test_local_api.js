fetch("http://localhost:5173/api/transcript?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  .then(res => {
    console.log("Status:", res.status);
    return res.text();
  })
  .then(text => console.log("Body:", text.substring(0, 100)))
  .catch(err => console.error(err));
