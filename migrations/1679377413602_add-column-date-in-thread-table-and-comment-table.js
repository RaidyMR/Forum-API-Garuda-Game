/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('threads', {
    date: {
      type: 'TEXT',
      notNull: false,
    },
  });
  pgm.addColumns('comments', {
    date: {
      type: 'TEXT',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('threads', 'date');
  pgm.dropColumns('comments', 'date');
};
