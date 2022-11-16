module.exports = {
    productList : {
        query: `SELECT seq, product_no, name, location, area, type, rental_fee, deposite, utility, detail, sub_img1, sub_img2, floor_img, use_yn, reg_date
        FROM T_product WHERE use_yn = 'Y'`
    },
    userList : {
        query: `SELECT * FROM T_users`
    }
}