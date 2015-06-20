/*
 * Curly brace path https://gist.github.com/alexhornbake/6005176
 */


//returns path string d for <path d="This string">
//a curly brace between x1,y1 and x2,y2, w pixels wide
//and q factor, .5 is normal, higher q = more expressive bracket
export default function curlyBrace(x1,y1,x2,y2,w,q) {

  //Calculate unit vector
  let dx = x1-x2;
  let dy = y1-y2;
  let len = Math.sqrt(dx*dx + dy*dy);
  dx = dx / len;
  dy = dy / len;

  //Calculate Control Points of path,
  let qx1 = x1 + q*w*dy;
  let qy1 = y1 - q*w*dx;
  let qx2 = (x1 - .25*len*dx) + (1-q)*w*dy;
  let qy2 = (y1 - .25*len*dy) - (1-q)*w*dx;
  let tx1 = (x1 -  .5*len*dx) + w*dy;
  let ty1 = (y1 -  .5*len*dy) - w*dx;
  let qx3 = x2 + q*w*dy;
  let qy3 = y2 - q*w*dx;
  let qx4 = (x1 - .75*len*dx) + (1-q)*w*dy;
  let qy4 = (y1 - .75*len*dy) - (1-q)*w*dx;

  return (  " M " +  x1 + " " +  y1 +
            " Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 +
            " T " + tx1 + " " + ty1 +
            " M " +  x2 + " " +  y2 +
            " Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 +
            " T " + tx1 + " " + ty1 );
}