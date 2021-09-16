// Spheres are pain

// 1 degree of longitude changes depending on your latitude.
// So a square that is 1 lon x 1 lat is actually a rectangle.
// This means we have to define our square as something like
// 100m x 100m, and then figure out what the lat/lon of that
// actually is, which is what we're doing here.

// Even then, I think it will have a selection range in the
// shape of a parralelogram or trapezium because we're only
// getting the minimum/maximum lat and lon, or in other words,
// the bottom left and top right points to form our square,
// which would work fine IF THIS DUMB ROCK WASN'T A SPHERE!

// It it wrong to assume the distance from the bottom left to
// the top left point is 100m (like the left side in a 100x100
// square would be), because the real-world distance of 1 deg
// in longitude will be different because the top side is at
// a different latitude to the bottom!

// Also, all these calculations assume Earth is a sphere,
// which is it not, but I cannot be bothered anymore, so here
// is the code. It won't make a complete square, but it's better
// than a 1 degree by 1 degree "square" that I was originally
// going to do.

// https://stackoverflow.com/questions/15258078/latitude-longitude-and-meters

const circumference = 40075.017;

module.exports = (lat, lon, length) => {
  const half = length / 2;

  const lat1 = lat - (360 * half) / circumference;
  const lon1 =
    lon - (360 * half) / circumference / Math.cos((Math.PI / 180) * lat1);

  const lat2 = lat + (360 * half) / circumference;
  const lon2 =
    lon + (360 * half) / circumference / Math.cos((Math.PI / 180) * lat2);

  return { lat1, lon1, lat2, lon2 };
};
