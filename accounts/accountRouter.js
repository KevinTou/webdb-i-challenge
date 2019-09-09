const express = require('express');

const Accounts = require('../data/dbConfig');

const router = express.Router();

router.get('/', (req, res) => {
  // Accounts.select('*').from('accounts') // same as line 9
  Accounts('accounts')
    .then(accounts => {
      res.status(200).json(accounts);
    })
    .catch(err => {
      res.status(500).json({
        message: 'Error occurred while getting all accounts.',
        err: err,
      });
    });
});

router.get('/:id', validateAccountId, (req, res) => {
  res.status(200).json(req.account);
});

router.post('/', validateAccount, (req, res) => {
  const accountData = req.body;

  Accounts('accounts')
    .insert(accountData, 'id')
    .then(([id]) => {
      Accounts('accounts')
        .where({ id })
        .first()
        .then(account => {
          res.status(201).json(account);
        })
        .catch(err => {
          res.status(500).json({
            message: 'Error occurred while getting account by id.',
            err: err,
          });
        });
    })
    .catch(err => {
      if (err.errno === 19) {
        res.status(500).json({
          message: 'There cannot be accounts with the same name.',
          err: err,
        });
      } else {
        res.status(500).json({
          message: 'Error occurred while adding a new account.',
          err: err,
        });
      }
    });
});

router.put('/:id', validateAccountId, validateAccount, (req, res) => {
  const changes = req.body;

  Accounts('accounts')
    .where('id', req.params.id) // select * from `accounts` where `id` = req.params.id
    .update(changes)
    .then(count => {
      res.status(200).json({ message: `Updated ${count} account(s).` });
      // Accounts('accounts') // return the updated object
      //   .where('id', req.params.id)
      //   .first()
      //   .then(account => {
      //     if (account) {
      //       res.status(200).json(account);
      //     } else {
      //       res
      //         .status(404)
      //         .json({ message: `User with the id ${id} not found.` });
      //     }
      //   })
      //   .catch(err => {
      //     res.status(500).json({
      //       message: 'Error occurred while getting account by id.',
      //       err: err,
      //     });
      //   });
    })
    .catch(err => {
      if (err.errno === 19) {
        res.status(500).json({
          message: 'There cannot be accounts with the same name.',
          err: err,
        });
      } else {
        res.status(500).json({
          message: 'Error occurred while adding a new account.',
          err: err,
        });
      }
    });
});

router.delete('/:id', validateAccountId, (req, res) => {
  Accounts('accounts')
    .where({ id: req.params.id }) // select `id` from `accounts` where `id` = 'req.params.id'
    .del()
    .then(count => {
      res.status(200).json({ message: `Deleted ${count} account(s).` });
      // Return the deleted object instead.
      // res.status(200).json({
      //   message: `Successfully deleted account with the id ${req.params.id}.`,
      //   deletedAccount: req.account,
      // });
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'Error occurred while deleting account.', err: err });
    });
});

function validateAccount(req, res, next) {
  const accountData = req.body;

  if (
    !Object.keys(accountData).includes('name') &&
    !Object.keys(accountData).includes('budget')
  ) {
    return res.status(400).json({ message: 'Missing name or budget.' });
  }

  if (typeof accountData.name !== 'string') {
    return res
      .status(400)
      .json({ message: 'Invalid data type. Expecting a string.' });
  } else if (typeof accountData.budget !== 'number') {
    return res
      .status(400)
      .json({ message: 'Invalid data type. Expecting a number.' });
  } else if (Object.keys(accountData).length > 2) {
    return res
      .status(400)
      .json({ message: 'Invalid data. Expecting only name and budget.' });
  }

  next();
}

function validateAccountId(req, res, next) {
  const { id } = req.params;

  Accounts('accounts')
    .where({ id })
    .first()
    .then(account => {
      if (account) {
        req.account = account;
        next();
      } else {
        return res
          .status(404)
          .json({ message: `User with the id ${id} not found.` });
      }
    })
    .catch(err => {
      return res.status(500).json({
        message: 'Error occurred while getting account by id.',
        err: err,
      });
    });
}

module.exports = router;
