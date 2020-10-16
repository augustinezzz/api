

exports.say = function(req,res) {
    let keyword = req.query.keyword || 'hello';

res.status(200).send('Augustine says ${keyword}!');
}