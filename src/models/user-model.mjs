import promisePool from '../utils/database.mjs';

const listAllUsers = async () => {
  try {
    const sql = 'SELECT user_id, username, user_level FROM Users';
    const [rows] = await promisePool.query(sql);
    //console.log(rows);
    return rows;
  } catch (error) {
    console.error('listAllUsers', error);
    return {error: 500, message: 'Database error'};
  }
};

const selectUserById = async (id) => {
  try {
    const sql = 'SELECT * FROM Users WHERE user_id=?';
    const params = [id];
    const [rows] = await promisePool.query(sql, params);
    //console.log(rows);
    // if nothing is found with the user id, result array is empty []
    if (rows.length === 0) {
      return {error: 404, message: 'user not found'};
    }
    // Remove password property from result
    delete rows[0].password;
    return rows[0];
  } catch (error) {
    console.error('selectUserById', error);
    return {error: 500, message: 'Database error'};
  }
};

const insertUser = async (user, next) => {
  try {
    const sql = 'INSERT INTO Users (username, password, email) VALUES (?, ?, ?)';
    const params = [user.username, user.password, user.email];
    const [result] = await promisePool.query(sql, params);
    //console.log(result);
    return {message: 'new user created', user_id: result.insertId};
  } catch (error) {
    // now duplicate entry error is generic 500 error, should be fixed to 400 ?
    console.error('insertUser', error);
    // error handler can be used directly from model
    const err = new Error(error);
    err.status= 500;
    return next(new Error(err));
  }
};

const updateUserById = async (user) => {
  try {
    const sql = 'UPDATE Users SET username=?, password=?, email=? WHERE user_id=?';
    const params = [user.username, user.password, user.email, user.user_id];
    const [result] = await promisePool.query(sql, params);
    console.log(result);
    return {message: 'user data updated', user_id: user.user_id};
  } catch (error) {
    // fix error handling
    // now duplicate entry error is generic 500 error, should be fixed to 400 ?
    console.error('updateUserById', error);
    return {error: 500, message: 'Database error'};
  }
};

const deleteUserById = async (id) => {
  try {
    const sql = 'DELETE FROM Users WHERE user_id=?';
    const params = [id];
    const [result] = await promisePool.query(sql, params);
    console.log(result);
    if (result.affectedRows === 0) {
      return {error: 404, message: 'User not found'};
    }
    return {message: 'User deleted', user_id: id};
  } catch (error) {
    // Check if user have other data inserted, they need to be deleted first.
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return {error: 409, message: 'Cannot delete user: user has diary entries, need to be deleted first.'};
    }
    console.error('deleteUserById', error);
    return {error: 500, message: 'Database error'};
  }
};


const selectUserByUsername = async (username) => {
  try {
    const sql = 'SELECT * FROM Users WHERE username=?';
    const params = [username];
    const [rows] = await promisePool.query(sql, params);
    //console.log(rows);
    // if nothing is found with the username and password, login attempt has failed
    if (rows.length === 0) {
      return {error: 401, message: 'invalid username or password'};
    }

    return rows[0];
  } catch (error) {
    console.error('selectUserByNameAndPassword', error);
    return {error: 500, message: 'Database error'};
  }
};

export {
  listAllUsers,
  selectUserById,
  insertUser,
  updateUserById,
  deleteUserById,
  selectUserByUsername,
};

