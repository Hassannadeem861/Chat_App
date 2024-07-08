

// Yeh function wo member return karta hai jo current user nahi hai.
const otherMembers = (members, userId) => {
  return members.find((member) => member._id?.toString() !== userId?.toString());
};
// console.log("otherMembers: ", otherMembers);

export default otherMembers;
