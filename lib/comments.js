Comments = new Mongo.Collection('comments');

Meteor.methods({
	comment: function(commentAttributes) {
		var user = Meteor.user();
		var post = Posts.findOne(commentAttributes.postId);

		if (!user)
			throw new Meteor.Error(401, "You need to login to make comments");
		if (!commentAttributes.body)
			throw new Meteor.Error(422, "Please write some content");
		if (!post)
			throw new Meteor.Error(422, "You must comment on a post");

		var username = user.username || user.profile.name;

		comment = _.extend(_.pick(commentAttributes, 'postId', 'body'), {
			userId: user._id,
			author: username,
			submitted: new Date().getTime()
		});

		Posts.update(comment.postId, {$inc: {commentsCount: 1}});
		
		comment._id = Comments.insert(comment);
		createCommentNotification(comment);
		return comment._id;
	},

	remove:function(commentId) {
		var comment = Comments.findOne({_id: commentId});
		if (Meteor.user()._id === this.userId){
			Comments.remove({"_id": commentId});
			Posts.update(comment.postId, {$inc: {commentsCount: -1}});
		}
	}
});