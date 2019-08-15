module.exports = (name) => {
  const nameArr = name.split(' ');
  const [lastName] = nameArr.splice(nameArr.length - 1);

  const initials = nameArr.map((n) => n[0].toLowerCase()).join('');
  return `${initials}${lastName.toLowerCase()}`;
};